import { z } from 'zod'

export const notificationCategorySchema = z.enum(['music', 'merch', 'events', 'account'])

export const notificationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  category: notificationCategorySchema,
  title: z.string(),
  body: z.string(),
  deepLink: z.string().nullable().default(null),
  read: z.boolean().default(false),
  createdAt: z.union([z.number(), z.date()]),
})
export type Notification = z.infer<typeof notificationSchema>
