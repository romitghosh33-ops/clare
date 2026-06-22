import { NextResponse } from 'next/server'
import { constructWebhookEvent } from '@/lib/stripe/webhooks'
import { createAdminClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/client'
import type Stripe from 'stripe'

export async function POST(req: Request) {
  const body = await req.text()
  let event: Stripe.Event

  try {
    event = await constructWebhookEvent(body)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createAdminClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const orderId = session.metadata?.order_id
      if (!orderId) break

      // Mark order as paid
      await supabase.from('orders').update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        stripe_payment_intent_id: session.payment_intent as string,
        stripe_session_id: session.id,
      }).eq('id', orderId)

      // Reduce inventory
      const { data: items } = await supabase.from('order_items').select('product_id, quantity').eq('order_id', orderId)
      for (const item of items ?? []) {
        await supabase.rpc('decrement_stock', { product_id: item.product_id, qty: item.quantity })
      }

      // Create invoice record
      const { data: order } = await supabase.from('orders').select('*').eq('id', orderId).single()
      if (order) {
        await supabase.from('invoices').insert({
          order_id: orderId,
          buyer_id: order.buyer_id,
          amount: order.subtotal,
          tax_amount: order.tax_amount,
          total_amount: order.total_amount,
          currency: order.currency,
          status: 'paid',
          stripe_invoice_id: session.invoice as string,
          paid_at: new Date().toISOString(),
        })
      }

      // Clear cart
      const userId = session.metadata?.user_id
      if (userId) {
        const { data: orderItems } = await supabase.from('order_items').select('product_id').eq('order_id', orderId)
        const productIds = (orderItems ?? []).map((i: any) => i.product_id)
        if (productIds.length > 0) {
          await supabase.from('cart_items').delete().eq('user_id', userId).in('product_id', productIds)
        }
      }
      break
    }

    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session
      const orderId = session.metadata?.order_id
      if (orderId) {
        await supabase.from('orders').update({ status: 'cancelled' }).eq('id', orderId)
      }
      break
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const sellerId = sub.metadata?.seller_id
      if (!sellerId) break
      await supabase.from('sellers').update({
        stripe_subscription_id: sub.id,
        subscription_status: sub.status,
      }).eq('id', sellerId)
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const sellerId = sub.metadata?.seller_id
      if (sellerId) {
        await supabase.from('sellers').update({
          subscription_plan: 'free',
          subscription_status: 'cancelled',
          stripe_subscription_id: null,
        }).eq('id', sellerId)
      }
      break
    }

    case 'invoice.payment_failed': {
      const inv = event.data.object as Stripe.Invoice
      if (inv.subscription) {
        await supabase.from('sellers').update({ subscription_status: 'past_due' }).eq('stripe_subscription_id', inv.subscription)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
