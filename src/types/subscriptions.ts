import { z } from 'zod'
import { baseDocSchema } from './common'

export const planTierSchema = z.enum(['free', 'fan', 'vip'])
export type PlanTier = z.infer<typeof planTierSchema>

/**
 * Plan definitions are backend-configurable (Remote Config / Firestore
 * `plans` collection) — never hardcode price or benefits in components.
 */
export const planSchema = z.object({
  id: z.string(),
  tier: planTierSchema,
  artistId: z.string().nullable().default(null),
  stripePriceId: z.string(),
  priceCents: z.number().int().min(0),
  currency: z.enum(['EUR', 'USD', 'GBP']),
  interval: z.enum(['month', 'year']),
  benefits: z.array(z.string()),
  active: z.boolean().default(true),
})
export type Plan = z.infer<typeof planSchema>

export const subscriptionStatusSchema = z.enum([
  'trialing',
  'active',
  'past_due',
  'canceled',
  'incomplete',
  'incomplete_expired',
  'unpaid',
])
export type SubscriptionStatus = z.infer<typeof subscriptionStatusSchema>

export const subscriptionSchema = baseDocSchema.extend({
  userId: z.string(),
  artistId: z.string(),
  planId: z.string(),
  tier: planTierSchema,
  status: subscriptionStatusSchema,
  stripeSubscriptionId: z.string(),
  stripeCustomerId: z.string(),
  currentPeriodEnd: z.union([z.number(), z.date()]),
  cancelAtPeriodEnd: z.boolean().default(false),
})
export type Subscription = z.infer<typeof subscriptionSchema>

export const subscriptionEventSchema = z.object({
  id: z.string(),
  subscriptionId: z.string(),
  type: z.enum(['created', 'renewed', 'payment_failed', 'canceled', 'plan_changed']),
  stripeEventId: z.string(),
  createdAt: z.union([z.number(), z.date()]),
})
export type SubscriptionEvent = z.infer<typeof subscriptionEventSchema>
