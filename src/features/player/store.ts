import { create } from 'zustand'
import { Html5PlayerService, type PlayerService } from './PlayerService'
import type { PlayableTrack, PlayerState, RepeatMode } from './types'
import { trackListeningEvent } from '@/lib/analytics'

interface PlayerActions {
  playQueue: (tracks: PlayableTrack[], startIndex?: number) => void
  playNow: (track: PlayableTrack) => void
  enqueue: (track: PlayableTrack) => void
  togglePlay: () => void
  next: () => void
  previous: () => void
  seek: (seconds: number) => void
  setVolume: (volume: number) => void
  setRepeatMode: (mode: RepeatMode) => void
  toggleShuffle: () => void
}

const service: PlayerService = new Html5PlayerService()

let unsubscribers: (() => void)[] = []
let sessionId = crypto.randomUUID()
let lastReportedTrackId: string | null = null

function currentTrack(state: PlayerState): PlayableTrack | null {
  return state.queue[state.currentIndex] ?? null
}

export const usePlayerStore = create<PlayerState & PlayerActions>((set, get) => {
  function bindServiceEvents() {
    unsubscribers.forEach((unsub) => unsub())
    unsubscribers = [
      service.onTimeUpdate((currentTime, duration) => set({ currentTime, duration })),
      service.onPlayStateChange((isPlaying) => set({ isPlaying })),
      service.onError((error) => set({ error, isPlaying: false, loading: false })),
      service.onEnded(() => {
        const track = currentTrack(get())
        if (track) {
          trackListeningEvent('track_complete', {
            trackId: track.id,
            artistId: track.artistId,
            albumId: track.albumId,
            sessionId,
            progressSeconds: track.durationSeconds,
            durationSeconds: track.durationSeconds,
            source: 'queue',
          })
        }
        get().next()
      }),
    ]
    service.setMediaSessionHandlers({
      onPlay: () => get().togglePlay(),
      onPause: () => get().togglePlay(),
      onNext: () => get().next(),
      onPrevious: () => get().previous(),
      onSeek: (seconds) => get().seek(seconds),
    })
  }

  function loadIndex(index: number, autoplay: boolean) {
    const state = get()
    const track = state.queue[index]
    if (!track) return
    set({ currentIndex: index, loading: true, error: null, currentTime: 0 })
    service.load(track, autoplay)
    service.setMediaSessionMetadata(track)
    lastReportedTrackId = null
    set({ loading: false })
  }

  bindServiceEvents()

  return {
    queue: [],
    currentIndex: -1,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    repeatMode: 'off',
    shuffle: false,
    loading: false,
    error: null,

    playQueue: (tracks, startIndex = 0) => {
      set({ queue: tracks })
      loadIndex(startIndex, true)
      reportPlayStart(tracks[startIndex])
    },

    playNow: (track) => {
      const state = get()
      const existingIndex = state.queue.findIndex((t) => t.id === track.id)
      if (existingIndex >= 0) {
        loadIndex(existingIndex, true)
      } else {
        const queue = [...state.queue, track]
        set({ queue })
        loadIndex(queue.length - 1, true)
      }
      reportPlayStart(track)
    },

    enqueue: (track) => set((state) => ({ queue: [...state.queue, track] })),

    togglePlay: () => {
      const state = get()
      if (state.isPlaying) {
        service.pause()
        const track = currentTrack(state)
        if (track) {
          trackListeningEvent('track_pause', {
            trackId: track.id,
            artistId: track.artistId,
            albumId: track.albumId,
            sessionId,
            progressSeconds: state.currentTime,
            durationSeconds: track.durationSeconds,
            source: 'queue',
          })
        }
      } else {
        service.play()
        const track = currentTrack(state)
        if (track) {
          trackListeningEvent('track_resume', {
            trackId: track.id,
            artistId: track.artistId,
            albumId: track.albumId,
            sessionId,
            progressSeconds: state.currentTime,
            durationSeconds: track.durationSeconds,
            source: 'queue',
          })
        }
      }
    },

    next: () => {
      const state = get()
      if (state.queue.length === 0) return
      const track = currentTrack(state)
      if (track && state.currentIndex >= 0) {
        trackListeningEvent('track_skip', {
          trackId: track.id,
          artistId: track.artistId,
          albumId: track.albumId,
          sessionId,
          progressSeconds: state.currentTime,
          durationSeconds: track.durationSeconds,
          source: 'queue',
        })
      }
      let nextIndex = state.currentIndex + 1
      if (state.shuffle) {
        nextIndex = Math.floor(Math.random() * state.queue.length)
      } else if (nextIndex >= state.queue.length) {
        nextIndex = state.repeatMode === 'all' ? 0 : state.currentIndex
      }
      if (state.repeatMode === 'one') nextIndex = state.currentIndex
      loadIndex(nextIndex, true)
      const nextTrack = state.queue[nextIndex]
      if (nextTrack) reportPlayStart(nextTrack)
    },

    previous: () => {
      const state = get()
      if (state.queue.length === 0) return
      if (state.currentTime > 3) {
        service.seek(0)
        return
      }
      const prevIndex = Math.max(0, state.currentIndex - 1)
      loadIndex(prevIndex, true)
    },

    seek: (seconds) => {
      service.seek(seconds)
      set({ currentTime: seconds })
      const track = currentTrack(get())
      if (track) {
        trackListeningEvent('track_seek', {
          trackId: track.id,
          artistId: track.artistId,
          albumId: track.albumId,
          sessionId,
          progressSeconds: seconds,
          durationSeconds: track.durationSeconds,
          source: 'queue',
        })
      }
    },

    setVolume: (volume) => {
      service.setVolume(volume)
      set({ volume })
    },

    setRepeatMode: (repeatMode) => set({ repeatMode }),
    toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle })),
  }
})

function reportPlayStart(track: PlayableTrack | undefined) {
  if (!track || lastReportedTrackId === track.id) return
  lastReportedTrackId = track.id
  trackListeningEvent('track_play', {
    trackId: track.id,
    artistId: track.artistId,
    albumId: track.albumId,
    sessionId,
    progressSeconds: 0,
    durationSeconds: track.durationSeconds,
    source: 'queue',
  })
}

/** Call once when a fresh app foreground session starts (e.g. app mount). */
export function resetPlayerSession() {
  sessionId = crypto.randomUUID()
}
