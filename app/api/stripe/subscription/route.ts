import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/client'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { priceId, sellerId } = await req.json()
  const { data: profile } = await supabase.from('profiles').select('stripe_customer_id, email').eq('id', user.id).single()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: profile?.stripe_customer_id ? undefined : profile?.email,
    customer: profile?.stripe_customer_id ?? undefined,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/seller/dashboard?subscribed=true`,
    cancel_url: `${appUrl}/pricing`,
    metadata: { seller_id: sellerId },
    subscription_data: { metadata: { seller_id: sellerId } },
  })

  return NextResponse.json({ url: session.url })
}
