import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useProduct } from '../hooks/useProduct'
import { useCartStore } from '@/stores/cart'
import { toast } from '@/components/ui/toastStore'
import { Button, Skeleton, ErrorState, EmptyState } from '@/components/ui'
import { formatMoney } from '@/lib/money'

export default function ProductPage() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { product, variants, loading, error } = useProduct(productId)
  const addItem = useCartStore((s) => s.addItem)
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="px-4 pt-6">
        <Skeleton className="aspect-square w-full rounded-lg" />
        <Skeleton className="mt-4 h-6 w-1/2" />
      </div>
    )
  }

  if (error) return <ErrorState />
  if (!product) return <EmptyState title="Produit introuvable" />

  const selectedVariant = variants.find((v) => v.id === selectedVariantId) ?? variants[0] ?? null

  function handleAddToCart() {
    if (!product || !selectedVariant) return
    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      artistId: product.artistId,
      title: product.title,
      variantLabel: selectedVariant.label,
      imageUrl: product.images[0] ?? null,
      unitPriceCents: selectedVariant.priceCents,
      quantity: 1,
    })
    toast('Ajouté au panier', 'success')
    navigate('/cart')
  }

  return (
    <div className="pb-6">
      <div className="aspect-square w-full bg-black/10">
        {product.images[0] && <img src={product.images[0]} alt={product.title} className="size-full object-cover" />}
      </div>

      <div className="px-4 pt-4">
        <h1 className="font-display text-2xl tracking-wide">{product.title}</h1>
        {selectedVariant && <p className="mt-1 text-lg">{formatMoney(selectedVariant.priceCents, product.currency)}</p>}
        <p className="mt-3 text-sm text-black/60">{product.description}</p>

        {variants.length > 1 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => setSelectedVariantId(variant.id)}
                disabled={variant.stockQuantity === 0}
                className={`rounded-md border px-3 py-1.5 text-sm disabled:opacity-30 ${
                  (selectedVariant?.id ?? variants[0]?.id) === variant.id
                    ? 'border-noir bg-noir text-blanc'
                    : 'border-black/25 text-noir'
                }`}
              >
                {variant.label}
              </button>
            ))}
          </div>
        )}

        <Button
          className="mt-6 w-full"
          onClick={handleAddToCart}
          disabled={!selectedVariant || selectedVariant.stockQuantity === 0}
        >
          {selectedVariant?.stockQuantity === 0 ? 'Rupture de stock' : t('actions.addToCart')}
        </Button>
      </div>
    </div>
  )
}
