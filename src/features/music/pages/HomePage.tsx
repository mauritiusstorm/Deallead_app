import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useFeaturedArtists } from '../hooks/useFeaturedArtists'
import { Skeleton, EmptyState, ErrorState } from '@/components/ui'

export default function HomePage() {
  const { t } = useTranslation()
  const { artists, loading, error } = useFeaturedArtists()

  return (
    <div className="px-4 pt-6">
      <h1 className="font-display text-2xl tracking-wide">{t('nav.home')}</h1>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-white/70">Artistes à la une</h2>
        </div>

        {loading && (
          <div className="flex gap-3 overflow-x-auto">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="size-28 shrink-0 rounded-full" />
            ))}
          </div>
        )}

        {error && <ErrorState />}

        {!loading && !error && artists.length === 0 && (
          <EmptyState title="Aucun artiste" description="Reviens bientôt pour découvrir de nouveaux artistes." />
        )}

        {!loading && artists.length > 0 && (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {artists.map((artist) => (
              <Link key={artist.id} to={`/artists/${artist.slug}`} className="flex shrink-0 flex-col items-center gap-2">
                <div className="size-28 overflow-hidden rounded-full bg-white/10">
                  {artist.avatarUrl && <img src={artist.avatarUrl} alt={artist.name} className="size-full object-cover" />}
                </div>
                <span className="text-xs">{artist.name}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
