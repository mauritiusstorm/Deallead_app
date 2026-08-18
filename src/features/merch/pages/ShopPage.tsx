import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { THE_ARTIST_SLUG } from '@/config/artist'
import { useArtistBySlug } from '@/features/artists/hooks/useArtistBySlug'
import { useArtistProducts } from '../hooks/useArtistProducts'
import { Skeleton, EmptyState, ErrorState } from '@/components/ui'

export default function ShopPage() {
  const { t } = useTranslation()
  const { artist, loading: artistLoading } = useArtistBySlug(THE_ARTIST_SLUG)
  const { products, loading, error } = useArtistProducts(artist?.id)

  return (
    <div className="px-4 pt-6">
      <h1 className="font-display text-2xl tracking-wide">{t('nav.shop')}</h1>

      {(artistLoading || loading) && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-md" />
          ))}
        </div>
      )}

      {error && <ErrorState />}

      {!loading && !error && products.length === 0 && (
        <EmptyState title="Boutique bientôt disponible" description="Reviens bientôt pour découvrir les produits." />
      )}

      {!loading && products.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          {products.map((product) => (
            <Link key={product.id} to={`/shop/${product.id}`}>
              <div className="aspect-square overflow-hidden rounded-md bg-white/10">
                {product.images[0] && <img src={product.images[0]} alt="" className="size-full object-cover" />}
              </div>
              <p className="mt-2 truncate text-sm">{product.title}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
