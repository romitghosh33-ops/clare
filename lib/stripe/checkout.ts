import { stripe } from './client'
import type { CartItem } from '@/types'

export async function createCheckoutSession({
  items,
  buyerEmail,
  stripeCustomerId,
  successUrl,
  cancelUrl,
  metadata,
}: {
  items: CartItem[]
  buyerEmail: string
  stripeCustomerId?: string
  successUrl: string
  cancelUrl: string
  metadata: Record<string, string>
}) {
  const lineItems = items.map(item => ({
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
  }))

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: lineItems,
    customer_email: stripeCustomerId ? undefined : buyerEmail,
    customer: stripeCustomerId,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
    shipping_address_collection: {
      allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR'],
    },
    automatic_tax: { enabled: true },
    invoice_creation: { enabled: true },
  })

  return session
}

export async function createSellerSubscriptionSession({
  sellerId,
  priceId,
  customerId,
  successUrl,
  cancelUrl,
}: {
  sellerId: string
  priceId: string
  customerId?: string
  successUrl: string
  cancelUrl: string
}) {
  return stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    customer: customerId,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { seller_id: sellerId },
    subscription_data: { metadata: { seller_id: sellerId } },
  })
}
