export interface PlayableTrack {
  id: string
  artistId: string
  artistName: string
  albumId: string | null
  title: string
  artworkUrl: string | null
  audioUrl: string
  durationSeconds: number
}

export type RepeatMode = 'off' | 'all' | 'one'

export interface PlayerState {
  queue: PlayableTrack[]
  currentIndex: number
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  repeatMode: RepeatMode
  shuffle: boolean
  loading: boolean
  error: string | null
}
