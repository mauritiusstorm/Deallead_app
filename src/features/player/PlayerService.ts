import type { PlayableTrack } from './types'

/**
 * Abstracts the actual audio backend (HTML5 <audio> today; a native
 * Capacitor background-audio plugin later) plus the Media Session API,
 * so the Zustand store and UI never talk to either directly.
 */
export interface PlayerService {
  load(track: PlayableTrack, autoplay: boolean): void
  play(): void
  pause(): void
  seek(seconds: number): void
  setVolume(volume: number): void
  destroy(): void

  onTimeUpdate(cb: (currentTime: number, duration: number) => void): () => void
  onEnded(cb: () => void): () => void
  onPlayStateChange(cb: (isPlaying: boolean) => void): () => void
  onError(cb: (message: string) => void): () => void

  setMediaSessionHandlers(handlers: {
    onPlay: () => void
    onPause: () => void
    onNext: () => void
    onPrevious: () => void
    onSeek: (seconds: number) => void
  }): void
  setMediaSessionMetadata(track: PlayableTrack): void
}

export class Html5PlayerService implements PlayerService {
  private audio: HTMLAudioElement

  constructor() {
    this.audio = new Audio()
    this.audio.preload = 'metadata'
  }

  load(track: PlayableTrack, autoplay: boolean) {
    this.audio.src = track.audioUrl
    this.audio.load()
    if (autoplay) this.play()
  }

  play() {
    // Safari/older WebViews (and jsdom in tests) don't always return a
    // promise from play() despite the spec — never call .catch() on it directly.
    void Promise.resolve(this.audio.play()).catch(() => undefined)
  }

  pause() {
    this.audio.pause()
  }

  seek(seconds: number) {
    this.audio.currentTime = seconds
  }

  setVolume(volume: number) {
    this.audio.volume = Math.min(1, Math.max(0, volume))
  }

  destroy() {
    this.audio.pause()
    this.audio.src = ''
  }

  onTimeUpdate(cb: (currentTime: number, duration: number) => void) {
    const handler = () => cb(this.audio.currentTime, this.audio.duration || 0)
    this.audio.addEventListener('timeupdate', handler)
    this.audio.addEventListener('durationchange', handler)
    return () => {
      this.audio.removeEventListener('timeupdate', handler)
      this.audio.removeEventListener('durationchange', handler)
    }
  }

  onEnded(cb: () => void) {
    this.audio.addEventListener('ended', cb)
    return () => this.audio.removeEventListener('ended', cb)
  }

  onPlayStateChange(cb: (isPlaying: boolean) => void) {
    const onPlay = () => cb(true)
    const onPause = () => cb(false)
    this.audio.addEventListener('play', onPlay)
    this.audio.addEventListener('pause', onPause)
    return () => {
      this.audio.removeEventListener('play', onPlay)
      this.audio.removeEventListener('pause', onPause)
    }
  }

  onError(cb: (message: string) => void) {
    const handler = () => cb('Lecture impossible pour ce morceau.')
    this.audio.addEventListener('error', handler)
    return () => this.audio.removeEventListener('error', handler)
  }

  setMediaSessionHandlers(handlers: {
    onPlay: () => void
    onPause: () => void
    onNext: () => void
    onPrevious: () => void
    onSeek: (seconds: number) => void
  }) {
    if (!('mediaSession' in navigator)) return
    navigator.mediaSession.setActionHandler('play', handlers.onPlay)
    navigator.mediaSession.setActionHandler('pause', handlers.onPause)
    navigator.mediaSession.setActionHandler('nexttrack', handlers.onNext)
    navigator.mediaSession.setActionHandler('previoustrack', handlers.onPrevious)
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime != null) handlers.onSeek(details.seekTime)
    })
  }

  setMediaSessionMetadata(track: PlayableTrack) {
    if (!('mediaSession' in navigator)) return
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artistName,
      artwork: track.artworkUrl ? [{ src: track.artworkUrl, sizes: '512x512', type: 'image/png' }] : [],
    })
  }
}
