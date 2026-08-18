import { Link } from 'react-router-dom'
import { THE_ARTIST_SLUG } from '@/config/artist'
import { useArtistBySlug } from '@/features/artists/hooks/useArtistBySlug'
import { useArtistTracks } from '../hooks/useArtistTracks'
import { playTrackList } from '../playTracks'
import { Button, Skeleton, ErrorState, EmptyState } from '@/components/ui'
import { PageHeader } from '@/components/PageHeader'
import { Play } from '@/features/player/icons'

export default function HomePage() {
  const { artist, loading: artistLoading, error: artistError } = useArtistBySlug(THE_ARTIST_SLUG)
  const { tracks, loading: tracksLoading } = useArtistTracks(artist?.id)

  if (artistLoading) {
    return (
      <div className="px-4 pt-6">
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    )
  }

  if (artistError) return <ErrorState />
  if (!artist) {
    return (
      <EmptyState
        title="Rien à afficher"
        description="Le profil artiste n'existe pas encore. Lance le script de données de démo pour le créer."
      />
    )
  }

  const latestTrack = tracks[0]

  return (
    <div className="pb-6">
      <PageHeader title="Accueil" />

      {latestTrack && (
        <div className="relative mt-4 aspect-[4/5] w-full overflow-hidden">
          {latestTrack.artworkUrl && (
            <img src={latestTrack.artworkUrl} alt="" className="absolute inset-0 size-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-3 p-5">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-white/60">Nouveau morceau</span>
            <h2 className="font-display text-3xl leading-none tracking-wide">{latestTrack.title}</h2>
            <Button size="sm" onClick={() => void playTrackList(tracks, artist.name, 0)}>
              Écouter
            </Button>
          </div>
        </div>
      )}

      <section className="mt-6 px-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-white/50">Dernières sorties</h3>
          <Link to="/music" className="text-xs text-white/40 hover:text-white/70">
            Voir tout
          </Link>
        </div>

        {tracksLoading && (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-md" />
            ))}
          </div>
        )}

        {!tracksLoading && tracks.length === 0 && (
          <EmptyState title="Aucun morceau" description="Reviens bientôt pour écouter de nouveaux sons." />
        )}

        {!tracksLoading && tracks.length > 0 && (
          <div className="flex flex-col gap-1">
            {tracks.slice(0, 5).map((track, i) => (
              <button
                key={track.id}
                onClick={() => void playTrackList(tracks, artist.name, i)}
                className="flex items-center gap-3 rounded-md p-2 text-left hover:bg-white/5"
              >
                <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded bg-white/10">
                  {track.artworkUrl ? (
                    <img src={track.artworkUrl} alt="" className="size-full object-cover" />
                  ) : (
                    <Play />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{track.title}</p>
                  <p className="truncate text-xs text-white/50">{artist.name}</p>
                </div>
                <Play />
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
