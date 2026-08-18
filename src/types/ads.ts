import { z } from 'zod'
import { baseDocSchema } from './common'

export const advertisementSchema = baseDocSchema.extend({
  provider: z.string(),
  format: z.enum(['audio', 'display']),
  active: z.boolean().default(true),
})
export type Advertisement = z.infer<typeof advertisementSchema>

export const adImpressionSchema = z.object({
  id: z.string(),
  userId: z.string().nullable(),
  artistId: z.string().nullable(),
  provider: z.string(),
  format: z.enum(['audio', 'display']),
  clicked: z.boolean().default(false),
  timestamp: z.union([z.number(), z.date()]),
})
export type AdImpression = z.infer<typeof adImpressionSchema>
