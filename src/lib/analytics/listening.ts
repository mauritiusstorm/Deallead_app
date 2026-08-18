import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { ListeningEventType, Platform } from '@/types'
import { auth } from '@/lib/firebase'

type ListeningEventInput = {
  trackId: string
  artistId: string
  albumId: string | null
  sessionId: string
  progressSeconds: number
  durationSeconds: number
  source: 'album' | 'playlist' | 'search' | 'artist_page' | 'queue' | 'library'
}

function detectPlatform(): Platform {
  // Capacitor injects window.Capacitor at runtime on native builds.
  const cap = (globalThis as { Capacitor?: { getPlatform?: () => string } }).Capacitor
  const platform = cap?.getPlatform?.()
  if (platform === 'ios' || platform === 'android') return platform
  return 'web'
}

/**
 * Writes only significant, discrete listening events (play/pause/resume/
 * skip/complete/seek) — never a per-second progress tick — to keep
 * Firestore write volume and cost bounded. See spec §14/§29.
 */
export function trackListeningEvent(type: ListeningEventType, input: ListeningEventInput): void {
  const userId = auth.currentUser?.uid
  if (!userId) return

  void addDoc(collection(db, 'listeningEvents'), {
    type,
    userId,
    ...input,
    platform: detectPlatform(),
    timestamp: serverTimestamp(),
  }).catch((error: unknown) => {
    console.warn('[analytics] failed to record listening event', error)
  })
}
