import { z } from 'zod'
import { baseDocSchema, currencySchema, moneySchema } from './common'

export const productVariantSchema = z.object({
  id: z.string(),
  productId: z.string(),
  label: z.string(),
  size: z.string().nullable().default(null),
  color: z.string().nullable().default(null),
  priceCents: moneySchema,
  stockQuantity: z.number().int().min(0),
  sku: z.string(),
})
export type ProductVariant = z.infer<typeof productVariantSchema>

export const productSchema = baseDocSchema.extend({
  artistId: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().max(3000).default(''),
  category: z.enum(['apparel', 'accessories', 'other']).default('apparel'),
  images: z.array(z.string().url()).default([]),
  /** Denormalized min(variant.priceCents) — lets list views show a price without an N+1 variants fetch. Kept in sync wherever variants are written. */
  minPriceCents: moneySchema,
  currency: currencySchema.default('EUR'),
  status: z.enum(['draft', 'active', 'archived']).default('draft'),
  createdBy: z.string(),
})
export type Product = z.infer<typeof productSchema>

export const promoCodeSchema = baseDocSchema.extend({
  artistId: z.string(),
  code: z.string().min(3).max(40),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.number().min(0),
  stripePromotionCodeId: z.string().nullable().default(null),
  maxRedemptions: z.number().int().min(1).nullable().default(null),
  redemptionCount: z.number().int().min(0).default(0),
  expiresAt: z.union([z.number(), z.date()]).nullable().default(null),
  active: z.boolean().default(true),
})
export type PromoCode = z.infer<typeof promoCodeSchema>
