import { z } from 'zod'
import { baseDocSchema, localeSchema } from './common'

export const notificationPreferencesSchema = z.object({
  global: z.boolean().default(true),
  music: z.boolean().default(true),
  merch: z.boolean().default(true),
  events: z.boolean().default(true),
  account: z.boolean().default(true),
})
export type NotificationPreferences = z.infer<typeof notificationPreferencesSchema>

export const userSchema = baseDocSchema.extend({
  displayName: z.string().min(1).max(80),
  email: z.string().email(),
  emailVerified: z.boolean().default(false),
  photoUrl: z.string().url().nullable().default(null),
  locale: localeSchema.default('fr'),
  notificationPreferences: notificationPreferencesSchema,
  onboardingCompleted: z.boolean().default(false),
  deletedAt: z.union([z.number(), z.date()]).nullable().default(null),
})
export type User = z.infer<typeof userSchema>

export const fcmTokenSchema = z.object({
  id: z.string(),
  userId: z.string(),
  token: z.string(),
  platform: z.enum(['web', 'ios', 'android']),
  deviceId: z.string().optional(),
  appVersion: z.string().optional(),
  createdAt: z.union([z.number(), z.date()]),
  lastSeenAt: z.union([z.number(), z.date()]),
})
export type FcmToken = z.infer<typeof fcmTokenSchema>
