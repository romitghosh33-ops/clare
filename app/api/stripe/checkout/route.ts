import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/client'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const { data: cartItems } = await supabase
    .from('cart_items')
    .select('*, product:products(*, seller:sellers(id, commission_rate, stripe_account_id))')
    .eq('user_id', user.id)

  if (!cartItems || cartItems.length === 0) {
    return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  // Create order in DB first (pending)
  const subtotal = cartItems.reduce((s: number, item: any) => s + item.product.price * item.quantity, 0)
  const platformFee = cartItems.reduce((s: number, item: any) =>
    s + (item.product.price * item.quantity * item.product.seller.commission_rate) / 100, 0)

  const { data: order, error: orderError } = await supabase.from('orders').insert({
    buyer_id: user.id,
    status: 'pending',
    subtotal: Math.round(subtotal * 100) / 100,
    shipping_amount: 0,
    tax_amount: 0,
    platform_fee: Math.round(platformFee * 100) / 100,
    total_amount: Math.round(subtotal * 100) / 100,
    currency: 'usd',
  }).select().single()

  if (orderError || !order) return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })

  // Insert order items
  const orderItems = cartItems.map((item: any) => {
    const totalPrice = item.product.price * item.quantity
    const commissionAmount = (totalPrice * item.product.seller.commission_rate) / 100
    return {
      order_id: order.id,
      product_id: item.product.id,
      seller_id: item.product.seller.id,
      quantity: item.quantity,
      unit_price: item.product.price,
      total_price: totalPrice,
      commission_rate: item.product.seller.commission_rate,
      commission_amount: commissionAmount,
      seller_payout: totalPrice - commissionAmount,
      product_snapshot: { title: item.product.title, images: item.product.images, sku: item.product.sku },
    }
  })

  await supabase.from('order_items').insert(orderItems)

  // Create Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: profile?.stripe_customer_id ? undefined : user.email,
    customer: profile?.stripe_customer_id ?? undefined,
    line_items: cartItems.map((item: any) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.product.title,
          images: item.product.images?.[0]?.url ? [item.product.images[0].url] : [],
          metadata: { product_id: item.product.id },
        },
        unit_amount: Math.round(item.product.price * 100),
      },
      quantity: item.quantity,
    })),
    success_url: `${appUrl}/account/orders?success=true&order=${order.id}`,
    cancel_url: `${appUrl}/cart?cancelled=true`,
    metadata: { order_id: order.id, user_id: user.id },
    shipping_address_collection: { allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR'] },
    automatic_tax: { enabled: true },
    invoice_creation: { enabled: true },
  })

  // Store session ID on order
  await supabase.from('orders').update({ stripe_session_id: session.id }).eq('id', order.id)

  return NextResponse.json({ url: session.url })
}
