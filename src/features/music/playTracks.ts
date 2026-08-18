import type { Track } from '@/types'
import type { PlayableTrack } from '@/features/player/types'
import { usePlayerStore } from '@/features/player/store'
import { resolveAudioUrl } from './resolveAudioUrl'

async function toPlayable(track: Track, artistName: string): Promise<PlayableTrack> {
  return {
    id: track.id,
    artistId: track.artistId,
    artistName,
    albumId: track.albumId,
    title: track.title,
    artworkUrl: track.artworkUrl,
    audioUrl: await resolveAudioUrl(track.audioStoragePath),
    durationSeconds: track.durationSeconds,
  }
}

/** Resolves every track's playable audio URL, then starts the queue at `startIndex`. */
export async function playTrackList(tracks: Track[], artistName: string, startIndex: number): Promise<void> {
  const playable = await Promise.all(tracks.map((t) => toPlayable(t, artistName)))
  usePlayerStore.getState().playQueue(playable, startIndex)
}
