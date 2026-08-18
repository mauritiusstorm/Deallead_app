import { z } from 'zod'
import { currencySchema, moneySchema } from './common'

export const revenueSourceSchema = z.enum(['advertising', 'subscription', 'merchandise', 'ticketing'])
export type RevenueSource = z.infer<typeof revenueSourceSchema>

export const revenueTransactionStatusSchema = z.enum(['pending', 'settled', 'reversed'])

/**
 * Immutable financial fact. Split percentages/amounts are frozen at
 * creation time from the artist's `activeRevenueSplitConfig` version in
 * effect at that moment — later config edits never retroactively change
 * a settled transaction. Written only by Cloud Functions.
 */
export const revenueTransactionSchema = z.object({
  id: z.string(),
  artistId: z.string(),
  source: revenueSourceSchema,
  externalReference: z.string(),
  grossAmountCents: moneySchema,
  currency: currencySchema,
  feesCents: moneySchema,
  netBeforeSplitCents: moneySchema,
  artistShareCents: moneySchema,
  teamShareCents: moneySchema.default(0),
  platformShareCents: moneySchema,
  finalNetCents: moneySchema,
  splitConfigVersion: z.number().int().min(1),
  status: revenueTransactionStatusSchema,
  createdAt: z.union([z.number(), z.date()]),
  updatedAt: z.union([z.number(), z.date()]),
  idempotencyKey: z.string(),
})
export type RevenueTransaction = z.infer<typeof revenueTransactionSchema>

export const revenueSplitSchema = z.object({
  id: z.string(),
  revenueTransactionId: z.string(),
  beneficiaryType: z.enum(['artist', 'team_member', 'platform']),
  beneficiaryId: z.string(),
  percentage: z.number().min(0).max(100),
  amountCents: moneySchema,
  currency: currencySchema,
  status: z.enum(['pending', 'paid']),
})
export type RevenueSplit = z.infer<typeof revenueSplitSchema>

export const payoutSchema = z.object({
  id: z.string(),
  artistId: z.string(),
  stripeTransferId: z.string().nullable().default(null),
  amountCents: moneySchema,
  currency: currencySchema,
  status: z.enum(['scheduled', 'in_transit', 'paid', 'failed']),
  periodStart: z.union([z.number(), z.date()]),
  periodEnd: z.union([z.number(), z.date()]),
  createdAt: z.union([z.number(), z.date()]),
})
export type Payout = z.infer<typeof payoutSchema>

/** Every Stripe webhook event ID processed, for idempotent handling. */
export const processedStripeEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  processedAt: z.union([z.number(), z.date()]),
})
export type ProcessedStripeEvent = z.infer<typeof processedStripeEventSchema>
