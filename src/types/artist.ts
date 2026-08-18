import { z } from 'zod'
import { baseDocSchema } from './common'
import { artistRoleSchema } from './roles'

export const socialLinksSchema = z.object({
  instagram: z.string().url().optional(),
  tiktok: z.string().url().optional(),
  youtube: z.string().url().optional(),
  spotify: z.string().url().optional(),
  x: z.string().url().optional(),
  website: z.string().url().optional(),
})
export type SocialLinks = z.infer<typeof socialLinksSchema>

/**
 * Revenue split configuration, versioned. A past `revenueTransaction`
 * stores the config version it was computed with — editing the config
 * later must never retroactively change historical transactions.
 */
export const revenueSplitConfigSchema = z.object({
  version: z.number().int().min(1),
  advertisingArtistPct: z.number().min(0).max(100).default(70),
  merchPlatformCommissionPct: z.number().min(0).max(100).default(10),
  subscriptionArtistPct: z.number().min(0).max(100).default(70),
  effectiveFrom: z.union([z.number(), z.date()]),
})
export type RevenueSplitConfig = z.infer<typeof revenueSplitConfigSchema>

export const artistStatusSchema = z.enum(['draft', 'published', 'suspended'])

export const artistSchema = baseDocSchema.extend({
  slug: z.string().min(1).max(60),
  name: z.string().min(1).max(80),
  /** Denormalized lowercase `name`, kept in sync by a Cloud Function trigger — powers the MVP prefix-range search query. */
  nameLower: z.string().min(1).max(80),
  bio: z.string().max(2000).default(''),
  avatarUrl: z.string().url().nullable().default(null),
  coverUrl: z.string().url().nullable().default(null),
  socialLinks: socialLinksSchema.default({}),
  status: artistStatusSchema.default('draft'),
  ownerUserId: z.string(),
  stripeConnectAccountId: z.string().nullable().default(null),
  stripeConnectOnboardingStatus: z.enum(['not_started', 'pending', 'complete', 'restricted']).default('not_started'),
  activeRevenueSplitConfig: revenueSplitConfigSchema,
  followerCount: z.number().int().min(0).default(0),
  createdBy: z.string(),
})
export type Artist = z.infer<typeof artistSchema>

export const artistMemberSchema = z.object({
  id: z.string(),
  artistId: z.string(),
  userId: z.string(),
  role: artistRoleSchema,
  invitedBy: z.string().nullable().default(null),
  status: z.enum(['invited', 'active', 'removed']).default('invited'),
  createdAt: z.union([z.number(), z.date()]),
  updatedAt: z.union([z.number(), z.date()]),
})
export type ArtistMember = z.infer<typeof artistMemberSchema>

export const artistInviteSchema = z.object({
  id: z.string(),
  artistId: z.string(),
  email: z.string().email(),
  role: artistRoleSchema,
  token: z.string(),
  status: z.enum(['pending', 'accepted', 'revoked', 'expired']).default('pending'),
  invitedBy: z.string(),
  createdAt: z.union([z.number(), z.date()]),
  expiresAt: z.union([z.number(), z.date()]),
})
export type ArtistInvite = z.infer<typeof artistInviteSchema>

export const followSchema = z.object({
  id: z.string(),
  userId: z.string(),
  artistId: z.string(),
  createdAt: z.union([z.number(), z.date()]),
})
export type Follow = z.infer<typeof followSchema>
