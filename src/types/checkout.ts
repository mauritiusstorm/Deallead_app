import { z } from 'zod'
import { baseDocSchema, currencySchema, moneySchema } from './common'

export const orderStatusSchema = z.enum([
  'pending_payment',
  'paid',
  'fulfilled',
  'cancelled',
  'refunded',
])
export type OrderStatus = z.infer<typeof orderStatusSchema>

export const orderItemSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  productId: z.string(),
  variantId: z.string(),
  title: z.string(),
  variantLabel: z.string(),
  quantity: z.number().int().min(1),
  unitPriceCents: moneySchema,
  totalCents: moneySchema,
})
export type OrderItem = z.infer<typeof orderItemSchema>

export const orderSchema = baseDocSchema.extend({
  userId: z.string(),
  artistId: z.string(),
  status: orderStatusSchema,
  currency: currencySchema,
  subtotalCents: moneySchema,
  shippingCents: moneySchema.default(0),
  discountCents: moneySchema.default(0),
  totalCents: moneySchema,
  promoCodeId: z.string().nullable().default(null),
  stripePaymentIntentId: z.string().nullable().default(null),
  stripeCheckoutSessionId: z.string().nullable().default(null),
  shippingAddress: z
    .object({
      name: z.string(),
      line1: z.string(),
      line2: z.string().optional(),
      city: z.string(),
      postalCode: z.string(),
      country: z.string(),
    })
    .nullable()
    .default(null),
})
export type Order = z.infer<typeof orderSchema>

export const cartItemSchema = z.object({
  productId: z.string(),
  variantId: z.string(),
  artistId: z.string(),
  title: z.string(),
  variantLabel: z.string(),
  imageUrl: z.string().url().nullable(),
  unitPriceCents: moneySchema,
  quantity: z.number().int().min(1),
})
export type CartItem = z.infer<typeof cartItemSchema>
