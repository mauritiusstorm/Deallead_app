import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { THE_ARTIST_SLUG } from '@/config/artist'
import { useArtistBySlug } from '@/features/artists/hooks/useArtistBySlug'
import { useArtistTracks } from '../hooks/useArtistTracks'
import { useArtistAlbums } from '../hooks/useArtistAlbums'
import { playTrackList } from '../playTracks'
import { Skeleton, ErrorState, EmptyState, Tabs } from '@/components/ui'
import { PageHeader } from '@/components/PageHeader'
import { ChevronRightIcon } from '@/components/icons'

type Tab = 'albums' | 'singles' | 'playlists'

function timestampToYear(value: unknown): string {
  if (!value) return ''
  if (value instanceof Date) return String(value.getFullYear())
  const withToDate = value as { toDate?: () => Date }
  if (typeof withToDate.toDate === 'function') return String(withToDate.toDate().getFullYear())
  const date = new Date(value as number)
  return Number.isNaN(date.getTime()) ? '' : String(date.getFullYear())
}

export default function MusicPage() {
  const [tab, setTab] = useState<Tab>('albums')
  const { artist, loading: artistLoading, error: artistError } = useArtistBySlug(THE_ARTIST_SLUG)
  const { tracks, loading: tracksLoading, error: tracksError } = useArtistTracks(artist?.id)
  const { albums, loading: albumsLoading, error: albumsError } = useArtistAlbums(artist?.id)

  const singles = useMemo(() => tracks.filter((t) => !t.albumId), [tracks])
  const loading = artistLoading || (tab === 'albums' ? albumsLoading : tracksLoading)
  const error = artistError || (tab === 'albums' ? albumsError : tracksError)

  if (artistLoading) {
    return (
      <div className="px-4 pt-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="mb-2 h-16 w-full rounded-md" />
        ))}
      </div>
    )
  }

  if (artistError) return <ErrorState />
  if (!artist) return <EmptyState title="Artiste introuvable" />

  return (
    <div className="pb-6">
      <PageHeader title="Musique" />

      <div className="mt-4 px-4">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { value: 'albums', label: 'Albums' },
            { value: 'singles', label: 'Singles' },
            { value: 'playlists', label: 'Playlists' },
          ]}
        />
      </div>

      <div className="mt-4 px-4">
        {loading && (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-md" />
            ))}
          </div>
        )}

        {!loading && error && <ErrorState />}

        {!loading && !error && tab === 'albums' && albums.length === 0 && <EmptyState title="Aucun album" />}
        {!loading && !error && tab === 'albums' && albums.length > 0 && (
          <div className="flex flex-col gap-1">
            {albums.map((album) => (
              <Link
                key={album.id}
                to={`/albums/${album.id}`}
                className="flex items-center gap-3 rounded-md p-2 hover:bg-black/5"
              >
                <div className="size-14 shrink-0 overflow-hidden rounded bg-black/10">
                  {album.artworkUrl && <img src={album.artworkUrl} alt="" className="size-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{album.title}</p>
                  <p className="truncate text-xs text-black/50">
                    {timestampToYear(album.releaseDate)} · {album.trackCount} titres
                  </p>
                </div>
                <ChevronRightIcon className="size-4 shrink-0 text-black/30" />
              </Link>
            ))}
          </div>
        )}

        {!loading && !error && tab === 'singles' && singles.length === 0 && (
          <EmptyState title="Aucun single" description="Les morceaux hors album apparaîtront ici." />
        )}
        {!loading && !error && tab === 'singles' && singles.length > 0 && (
          <div className="flex flex-col gap-1">
            {singles.map((track, i) => (
              <button
                key={track.id}
                onClick={() => void playTrackList(singles, artist.name, i)}
                className="flex items-center gap-3 rounded-md p-2 text-left hover:bg-black/5"
              >
                <div className="size-11 shrink-0 overflow-hidden rounded bg-black/10">
                  {track.artworkUrl && <img src={track.artworkUrl} alt="" className="size-full object-cover" />}
                </div>
                <p className="truncate text-sm">{track.title}</p>
              </button>
            ))}
          </div>
        )}

        {tab === 'playlists' && (
          <EmptyState title="Aucune playlist" description="Cette section arrive prochainement." />
        )}
      </div>
    </div>
  )
}
