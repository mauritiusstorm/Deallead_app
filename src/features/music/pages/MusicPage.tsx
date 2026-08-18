import { useTranslation } from 'react-i18next'
import { THE_ARTIST_SLUG } from '@/config/artist'
import { useArtistBySlug } from '@/features/artists/hooks/useArtistBySlug'
import { useArtistTracks } from '../hooks/useArtistTracks'
import { usePlayerStore } from '@/features/player/store'
import { playTrackList } from '../playTracks'
import { Skeleton, ErrorState, EmptyState } from '@/components/ui'
import { Pause, Play } from '@/features/player/icons'

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function MusicPage() {
  const { t } = useTranslation()
  const { artist, loading: artistLoading, error: artistError } = useArtistBySlug(THE_ARTIST_SLUG)
  const { tracks, loading, error } = useArtistTracks(artist?.id)
  const currentTrackId = usePlayerStore((s) => s.queue[s.currentIndex]?.id)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const togglePlay = usePlayerStore((s) => s.togglePlay)

  if (artistLoading || loading) {
    return (
      <div className="px-4 pt-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="mb-2 h-14 w-full rounded-md" />
        ))}
      </div>
    )
  }

  if (artistError || error) return <ErrorState />
  if (!artist) return <EmptyState title="Artiste introuvable" />

  return (
    <div className="px-4 pt-6">
      <h1 className="font-display text-2xl tracking-wide">{t('nav.music')}</h1>

      {tracks.length === 0 && (
        <EmptyState title="Aucun morceau" description="Reviens bientôt pour écouter de nouveaux sons." />
      )}

      <div className="mt-4 flex flex-col gap-1">
        {tracks.map((track, i) => {
          const isCurrent = track.id === currentTrackId
          return (
            <button
              key={track.id}
              onClick={() => (isCurrent ? togglePlay() : void playTrackList(tracks, artist.name, i))}
              className="flex items-center gap-3 rounded-md p-2 text-left hover:bg-white/5"
            >
              <div className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded bg-white/10">
                {track.artworkUrl && <img src={track.artworkUrl} alt="" className="absolute inset-0 size-full object-cover" />}
                <span className="relative">{isCurrent && isPlaying ? <Pause /> : <Play />}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className={`truncate text-sm ${isCurrent ? 'text-blanc' : 'text-white/85'}`}>{track.title}</p>
              </div>
              <span className="shrink-0 text-xs text-white/40">{formatDuration(track.durationSeconds)}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
