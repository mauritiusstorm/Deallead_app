import { useParams } from 'react-router-dom'
import { useAlbum } from '../hooks/useAlbum'
import { useAlbumTracks } from '../hooks/useAlbumTracks'
import { useArtistBySlug } from '@/features/artists/hooks/useArtistBySlug'
import { THE_ARTIST_SLUG } from '@/config/artist'
import { playTrackList } from '../playTracks'
import { usePlayerStore } from '@/features/player/store'
import { Skeleton, ErrorState, EmptyState } from '@/components/ui'
import { PageHeader } from '@/components/PageHeader'
import { Pause } from '@/features/player/icons'

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function AlbumPage() {
  const { albumId } = useParams()
  const { artist } = useArtistBySlug(THE_ARTIST_SLUG)
  const { album, loading: albumLoading, error: albumError } = useAlbum(albumId)
  const { tracks, loading: tracksLoading, error: tracksError } = useAlbumTracks(albumId)
  const currentTrackId = usePlayerStore((s) => s.queue[s.currentIndex]?.id)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const togglePlay = usePlayerStore((s) => s.togglePlay)

  if (albumLoading) {
    return (
      <div className="px-4 pt-6">
        <Skeleton className="aspect-square w-full rounded-lg" />
      </div>
    )
  }

  if (albumError || tracksError) return <ErrorState />
  if (!album) return <EmptyState title="Album introuvable" />

  return (
    <div className="pb-6">
      <PageHeader title={album.title} back />

      <div className="mt-4 flex flex-col items-center gap-2 px-6 text-center">
        <div className="aspect-square w-48 overflow-hidden rounded-lg bg-black/10">
          {album.artworkUrl && <img src={album.artworkUrl} alt="" className="size-full object-cover" />}
        </div>
        <h1 className="mt-2 font-display text-2xl tracking-wide">{album.title}</h1>
        <p className="text-sm text-black/50">{artist?.name}</p>
      </div>

      <div className="mt-6 px-4">
        {tracksLoading && (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-md" />
            ))}
          </div>
        )}

        {!tracksLoading && tracks.length === 0 && <EmptyState title="Aucun morceau" />}

        {!tracksLoading && tracks.length > 0 && (
          <div className="flex flex-col gap-1">
            {tracks.map((track, i) => {
              const isCurrent = track.id === currentTrackId
              return (
                <button
                  key={track.id}
                  onClick={() => (isCurrent ? togglePlay() : void playTrackList(tracks, artist?.name ?? '', i))}
                  className="flex items-center gap-3 rounded-md p-2 text-left hover:bg-black/5"
                >
                  <span className="w-5 shrink-0 text-center text-xs text-black/40">
                    {isCurrent && isPlaying ? <Pause /> : track.trackNumber}
                  </span>
                  <span className={`min-w-0 flex-1 truncate text-sm ${isCurrent ? 'text-noir' : 'text-black/85'}`}>
                    {track.title}
                  </span>
                  <span className="shrink-0 text-xs text-black/40">{formatDuration(track.durationSeconds)}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
