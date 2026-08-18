import { getDownloadURL, ref } from 'firebase/storage'
import { storage } from '@/lib/firebase'

/**
 * `Track.audioStoragePath` is normally a Firebase Storage path, but demo
 * seed data points straight at an external sample-audio URL — accept
 * either without touching the schema.
 */
export async function resolveAudioUrl(audioStoragePath: string): Promise<string> {
  if (audioStoragePath.startsWith('http')) return audioStoragePath
  return getDownloadURL(ref(storage, audioStoragePath))
}
