import { stripe } from './client'
import { headers } from 'next/headers'
import type Stripe from 'stripe'

export async function constructWebhookEvent(body: string): Promise<Stripe.Event> {
  const headersList = await headers()
  const sig = headersList.get('stripe-signature')!
  return stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
}
