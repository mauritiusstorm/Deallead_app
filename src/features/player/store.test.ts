import { describe, expect, it, vi, beforeEach } from 'vitest'

vi.mock('@/lib/analytics', () => ({ trackListeningEvent: vi.fn() }))
vi.mock('@/lib/firebase', () => ({ auth: { currentUser: null } }))

import { usePlayerStore } from './store'
import type { PlayableTrack } from './types'

function track(id: string): PlayableTrack {
  return {
    id,
    artistId: 'artist-1',
    artistName: 'Test Artist',
    albumId: null,
    title: `Track ${id}`,
    artworkUrl: null,
    audioUrl: `https://example.com/${id}.mp3`,
    durationSeconds: 180,
  }
}

describe('usePlayerStore', () => {
  beforeEach(() => {
    usePlayerStore.setState({
      queue: [],
      currentIndex: -1,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      repeatMode: 'off',
      shuffle: false,
      loading: false,
      error: null,
    })
  })

  it('starts a queue at the given index', () => {
    usePlayerStore.getState().playQueue([track('a'), track('b'), track('c')], 1)
    const state = usePlayerStore.getState()
    expect(state.queue).toHaveLength(3)
    expect(state.currentIndex).toBe(1)
  })

  it('advances to the next track', () => {
    usePlayerStore.getState().playQueue([track('a'), track('b')], 0)
    usePlayerStore.getState().next()
    expect(usePlayerStore.getState().currentIndex).toBe(1)
  })

  it('does not advance past the end of the queue when repeat is off', () => {
    usePlayerStore.getState().playQueue([track('a'), track('b')], 1)
    usePlayerStore.getState().next()
    expect(usePlayerStore.getState().currentIndex).toBe(1)
  })

  it('wraps to the start when repeat mode is "all"', () => {
    usePlayerStore.getState().playQueue([track('a'), track('b')], 1)
    usePlayerStore.getState().setRepeatMode('all')
    usePlayerStore.getState().next()
    expect(usePlayerStore.getState().currentIndex).toBe(0)
  })

  it('adds a new track to the queue without duplicating an existing one', () => {
    usePlayerStore.getState().playQueue([track('a')], 0)
    usePlayerStore.getState().playNow(track('a'))
    expect(usePlayerStore.getState().queue).toHaveLength(1)
  })
})
