import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
})

export const PLATFORM_FEE_PERCENT = 10 // Default platform fee (overridden per seller)

export function calculateFees(
  amount: number,
  commissionRate: number
): { platformFee: number; sellerPayout: number } {
  const platformFee = Math.round((amount * commissionRate) / 100)
  return { platformFee, sellerPayout: amount - platformFee }
}
