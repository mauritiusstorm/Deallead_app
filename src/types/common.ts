import { z } from 'zod'

/** All monetary amounts are integer minor units (cents) — never floats. */
export const moneySchema = z.number().int()

export const currencySchema = z.enum(['EUR', 'USD', 'GBP'])
export type Currency = z.infer<typeof currencySchema>

export const timestampSchema = z.union([z.number(), z.date()])

export const platformSchema = z.enum(['web', 'ios', 'android'])
export type Platform = z.infer<typeof platformSchema>

export const localeSchema = z.enum(['fr', 'en'])
export type Locale = z.infer<typeof localeSchema>

export const baseDocSchema = z.object({
  id: z.string(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
})
export type BaseDoc = z.infer<typeof baseDocSchema>

export interface Paginated<T> {
  items: T[]
  cursor: string | null
  hasMore: boolean
}
