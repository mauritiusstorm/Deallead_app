import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { THE_ARTIST_SLUG } from '@/config/artist'
import { useArtistBySlug } from '@/features/artists/hooks/useArtistBySlug'
import { useArtistTracks } from '../hooks/useArtistTracks'
import { useArtistProducts } from '@/features/merch/hooks/useArtistProducts'
import { playTrackList } from '../playTracks'
import { Button, Skeleton, ErrorState, EmptyState } from '@/components/ui'
import { Play } from '@/features/player/icons'

export default function HomePage() {
  const { t } = useTranslation()
  const { artist, loading: artistLoading, error: artistError } = useArtistBySlug(THE_ARTIST_SLUG)
  const { tracks, loading: tracksLoading } = useArtistTracks(artist?.id, 5)
  const { products, loading: productsLoading } = useArtistProducts(artist?.id, 4)

  if (artistLoading) {
    return (
      <div className="px-4 pt-6">
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="mt-4 h-6 w-1/2" />
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

  return (
    <div className="pb-6">
      <div className="relative h-48 w-full bg-white/5">
        {artist.coverUrl && <img src={artist.coverUrl} alt="" className="size-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/20 to-transparent" />
      </div>

      <div className="-mt-12 flex flex-col items-center gap-2 px-4 text-center">
        <div className="size-20 overflow-hidden rounded-full border-4 border-noir bg-white/10">
          {artist.avatarUrl && <img src={artist.avatarUrl} alt={artist.name} className="size-full object-cover" />}
        </div>
        <h1 className="font-display text-3xl tracking-wide">{artist.name}</h1>
        <p className="max-w-sm text-sm text-white/60">{artist.bio}</p>
      </div>

      <section className="mt-8 px-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-white/70">Derniers morceaux</h2>
          <Link to="/music" className="text-xs text-white/40 hover:text-white/70">
            {t('actions.seeAll')}
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
            {tracks.map((track, i) => (
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
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8 px-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-white/70">Boutique</h2>
          <Link to="/shop" className="text-xs text-white/40 hover:text-white/70">
            {t('actions.seeAll')}
          </Link>
        </div>

        {productsLoading && (
          <div className="flex gap-3 overflow-x-auto">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-32 shrink-0 rounded-md" />
            ))}
          </div>
        )}

        {!productsLoading && products.length === 0 && (
          <EmptyState title="Boutique bientôt disponible" />
        )}

        {!productsLoading && products.length > 0 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {products.map((product) => (
              <Link key={product.id} to={`/shop/${product.id}`} className="w-32 shrink-0">
                <div className="aspect-square overflow-hidden rounded-md bg-white/10">
                  {product.images[0] && <img src={product.images[0]} alt="" className="size-full object-cover" />}
                </div>
                <p className="mt-1.5 truncate text-xs">{product.title}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <div className="mt-8 flex justify-center px-4">
        <Link to="/shop">
          <Button variant="secondary" size="sm">
            {t('nav.shop')}
          </Button>
        </Link>
      </div>
    </div>
  )
}
