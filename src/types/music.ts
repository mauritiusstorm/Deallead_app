import { z } from 'zod'
import { baseDocSchema } from './common'

export const contentStatusSchema = z.enum(['draft', 'processing', 'published', 'failed'])
export type ContentStatus = z.infer<typeof contentStatusSchema>

export const trackSchema = baseDocSchema.extend({
  artistId: z.string(),
  albumId: z.string().nullable().default(null),
  title: z.string().min(1).max(200),
  durationSeconds: z.number().int().min(0).default(0),
  trackNumber: z.number().int().min(1).default(1),
  artworkUrl: z.string().url().nullable().default(null),
  audioStoragePath: z.string(),
  audioProcessingStatus: z.enum(['queued', 'processing', 'ready', 'failed']).default('queued'),
  status: contentStatusSchema.default('draft'),
  releaseDate: z.union([z.number(), z.date()]).nullable().default(null),
  playCount: z.number().int().min(0).default(0),
  rightsDeclared: z.boolean().default(false),
  createdBy: z.string(),
})
export type Track = z.infer<typeof trackSchema>

export const albumSchema = baseDocSchema.extend({
  artistId: z.string(),
  title: z.string().min(1).max(200),
  type: z.enum(['single', 'ep', 'album']).default('album'),
  artworkUrl: z.string().url().nullable().default(null),
  status: contentStatusSchema.default('draft'),
  releaseDate: z.union([z.number(), z.date()]).nullable().default(null),
  trackCount: z.number().int().min(0).default(0),
  createdBy: z.string(),
})
export type Album = z.infer<typeof albumSchema>

export const playlistSchema = baseDocSchema.extend({
  ownerUserId: z.string(),
  title: z.string().min(1).max(120),
  trackIds: z.array(z.string()).default([]),
  isPublic: z.boolean().default(false),
})
export type Playlist = z.infer<typeof playlistSchema>

export const favoriteSchema = z.object({
  id: z.string(),
  userId: z.string(),
  trackId: z.string(),
  artistId: z.string(),
  createdAt: z.union([z.number(), z.date()]),
})
export type Favorite = z.infer<typeof favoriteSchema>

export const exclusiveContentSchema = baseDocSchema.extend({
  artistId: z.string(),
  title: z.string().min(1).max(200),
  type: z.enum(['text', 'photo', 'video', 'audio']),
  body: z.string().max(5000).nullable().default(null),
  mediaStoragePath: z.string().nullable().default(null),
  accessLevel: z.enum(['free', 'fan', 'purchase']).default('fan'),
  status: contentStatusSchema.default('draft'),
  publishedAt: z.union([z.number(), z.date()]).nullable().default(null),
  createdBy: z.string(),
})
export type ExclusiveContent = z.infer<typeof exclusiveContentSchema>
