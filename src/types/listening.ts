import { z } from 'zod'
import { platformSchema } from './common'

/**
 * Significant listening events only — never one per progress tick.
 * See src/lib/analytics for the debouncing/threshold policy.
 */
export const listeningEventTypeSchema = z.enum([
  'track_play',
  'track_pause',
  'track_resume',
  'track_skip',
  'track_complete',
  'track_seek',
])
export type ListeningEventType = z.infer<typeof listeningEventTypeSchema>

export const listeningEventSchema = z.object({
  id: z.string(),
  type: listeningEventTypeSchema,
  userId: z.string(),
  artistId: z.string(),
  trackId: z.string(),
  albumId: z.string().nullable().default(null),
  sessionId: z.string(),
  timestamp: z.union([z.number(), z.date()]),
  progressSeconds: z.number().min(0),
  durationSeconds: z.number().min(0),
  source: z.enum(['album', 'playlist', 'search', 'artist_page', 'queue', 'library']),
  device: z.string().optional(),
  platform: platformSchema,
  appVersion: z.string().optional(),
})
export type ListeningEvent = z.infer<typeof listeningEventSchema>

export const listeningSessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  startedAt: z.union([z.number(), z.date()]),
  endedAt: z.union([z.number(), z.date()]).nullable().default(null),
  platform: platformSchema,
  trackCount: z.number().int().min(0).default(0),
})
export type ListeningSession = z.infer<typeof listeningSessionSchema>
