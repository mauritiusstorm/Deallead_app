import Stripe from 'stripe'
import { defineSecret } from 'firebase-functions/params'

export const stripeSecretKey = defineSecret('STRIPE_SECRET_KEY')
export const stripeWebhookSecret = defineSecret('STRIPE_WEBHOOK_SECRET')
export const stripeConnectWebhookSecret = defineSecret('STRIPE_CONNECT_WEBHOOK_SECRET')

let stripe: Stripe | undefined

export function getStripe(): Stripe {
  if (!stripe) {
    stripe = new Stripe(stripeSecretKey.value(), { apiVersion: '2026-07-29.dahlia' })
  }
  return stripe
}
