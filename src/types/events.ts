import { z } from 'zod'
import { baseDocSchema, currencySchema, moneySchema } from './common'

export const eventSchema = baseDocSchema.extend({
  artistId: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().max(3000).default(''),
  venue: z.string(),
  city: z.string(),
  country: z.string(),
  startsAt: z.union([z.number(), z.date()]),
  imageUrl: z.string().url().nullable().default(null),
  status: z.enum(['draft', 'published', 'cancelled', 'completed']).default('draft'),
  ticketing: z.discriminatedUnion('mode', [
    z.object({ mode: z.literal('external_link'), url: z.string().url() }),
    z.object({
      mode: z.literal('internal'),
      priceCents: moneySchema,
      currency: currencySchema,
      capacity: z.number().int().min(1),
      ticketsSold: z.number().int().min(0).default(0),
    }),
  ]),
  createdBy: z.string(),
})
export type Event = z.infer<typeof eventSchema>

export const ticketOrderSchema = baseDocSchema.extend({
  eventId: z.string(),
  artistId: z.string(),
  userId: z.string(),
  quantity: z.number().int().min(1),
  totalCents: moneySchema,
  currency: currencySchema,
  status: z.enum(['pending_payment', 'confirmed', 'cancelled', 'refunded']),
  stripePaymentIntentId: z.string().nullable().default(null),
})
export type TicketOrder = z.infer<typeof ticketOrderSchema>
