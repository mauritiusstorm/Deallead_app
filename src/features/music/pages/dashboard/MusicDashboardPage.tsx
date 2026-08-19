import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useArtistAlbums } from '../../hooks/useArtistAlbums'
import { useArtistTracks } from '../../hooks/useArtistTracks'
import { Button, Card, Skeleton, EmptyState, ErrorState } from '@/components/ui'
import { ChevronRightIcon } from '@/components/icons'

export default function MusicDashboardPage() {
  const { artistId } = useParams()
  const { albums, loading: albumsLoading, error: albumsError } = useArtistAlbums(artistId)
  const { tracks, loading: tracksLoading, error: tracksError } = useArtistTracks(artistId, 100)

  const singles = useMemo(() => tracks.filter((t) => !t.albumId), [tracks])
  const loading = albumsLoading || tracksLoading

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Musique</h1>
        <div className="flex gap-2">
          <Link to="albums/new">
            <Button variant="secondary" size="sm">
              + Album
            </Button>
          </Link>
          <Link to="tracks/new">
            <Button size="sm">+ Morceau</Button>
          </Link>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-md" />
          ))}
        </div>
      )}

      {!loading && (albumsError || tracksError) && <ErrorState />}

      {!loading && !albumsError && !tracksError && (
        <>
          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-medium text-black/60">Albums</h2>
            {albums.length === 0 && (
              <EmptyState title="Aucun album" description="Crée un album pour regrouper tes morceaux." />
            )}
            {albums.map((album) => (
              <Card key={album.id} className="flex items-center gap-3">
                <div className="size-12 shrink-0 overflow-hidden rounded bg-black/10">
                  {album.artworkUrl && <img src={album.artworkUrl} alt="" className="size-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{album.title}</p>
                  <p className="text-xs text-black/50">{album.trackCount} titres</p>
                </div>
                <ChevronRightIcon className="size-4 shrink-0 text-black/30" />
              </Card>
            ))}
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-medium text-black/60">Singles</h2>
            {singles.length === 0 && <EmptyState title="Aucun single" description="Les morceaux hors album apparaîtront ici." />}
            {singles.map((track) => (
              <Card key={track.id} className="flex items-center gap-3">
                <div className="size-12 shrink-0 overflow-hidden rounded bg-black/10">
                  {track.artworkUrl && <img src={track.artworkUrl} alt="" className="size-full object-cover" />}
                </div>
                <p className="truncate text-sm font-medium">{track.title}</p>
              </Card>
            ))}
          </section>
        </>
      )}
    </div>
  )
}
