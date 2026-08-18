import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { THE_ARTIST_SLUG } from '@/config/artist'
import { useArtistBySlug } from '@/features/artists/hooks/useArtistBySlug'
import { useArtistProducts } from '../hooks/useArtistProducts'
import { Skeleton, EmptyState, ErrorState, Tabs } from '@/components/ui'
import { PageHeader } from '@/components/PageHeader'
import { formatMoney } from '@/lib/money'

type CategoryTab = 'all' | 'apparel' | 'accessories'

export default function ShopPage() {
  const [tab, setTab] = useState<CategoryTab>('all')
  const { artist, loading: artistLoading } = useArtistBySlug(THE_ARTIST_SLUG)
  const { products, loading, error } = useArtistProducts(artist?.id)

  const filtered = useMemo(
    () => (tab === 'all' ? products : products.filter((p) => p.category === tab)),
    [products, tab],
  )

  return (
    <div className="pb-6">
      <PageHeader title="Boutique" />

      <div className="mt-4 px-4">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { value: 'all', label: 'Tout' },
            { value: 'apparel', label: 'Vêtements' },
            { value: 'accessories', label: 'Accessoires' },
          ]}
        />
      </div>

      {(artistLoading || loading) && (
        <div className="mt-4 grid grid-cols-2 gap-4 px-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-md" />
          ))}
        </div>
      )}

      {error && <ErrorState />}

      {!loading && !error && filtered.length === 0 && (
        <div className="px-4">
          <EmptyState title="Boutique bientôt disponible" description="Reviens bientôt pour découvrir les produits." />
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-4 px-4">
          {filtered.map((product) => (
            <Link key={product.id} to={`/shop/${product.id}`}>
              <div className="aspect-square overflow-hidden rounded-md bg-white/10">
                {product.images[0] && <img src={product.images[0]} alt="" className="size-full object-cover" />}
              </div>
              <p className="mt-2 truncate text-sm">{product.title}</p>
              <p className="text-xs text-white/50">{formatMoney(product.minPriceCents, product.currency)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
