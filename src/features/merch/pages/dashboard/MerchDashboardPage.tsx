import { Link, useParams } from 'react-router-dom'
import { useArtistProducts } from '../../hooks/useArtistProducts'
import { Button, Card, Skeleton, EmptyState, ErrorState } from '@/components/ui'
import { formatMoney } from '@/lib/money'

export default function MerchDashboardPage() {
  const { artistId } = useParams()
  const { products, loading, error } = useArtistProducts(artistId, 100)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Boutique</h1>
        <Link to="products/new">
          <Button size="sm">+ Produit</Button>
        </Link>
      </div>

      {loading && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-md" />
          ))}
        </div>
      )}

      {!loading && error && <ErrorState />}

      {!loading && !error && products.length === 0 && (
        <EmptyState title="Aucun produit" description="Ajoute ton premier vêtement ou accessoire." />
      )}

      {!loading && !error && products.length > 0 && (
        <div className="flex flex-col gap-2">
          {products.map((product) => (
            <Card key={product.id} className="flex items-center gap-3">
              <div className="size-12 shrink-0 overflow-hidden rounded bg-black/10">
                {product.images[0] && <img src={product.images[0]} alt="" className="size-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{product.title}</p>
                <p className="text-xs text-black/50">{formatMoney(product.minPriceCents, product.currency)}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
