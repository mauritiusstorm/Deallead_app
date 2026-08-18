import { useState } from 'react'
import { useCartStore, cartTotalCents } from '@/stores/cart'
import { Button, EmptyState } from '@/components/ui'
import { toast } from '@/components/ui/toastStore'
import { formatMoney } from '@/lib/money'
import { startCheckout } from '../api'

export default function CartPage() {
  const items = useCartStore((s) => s.items)
  const setQuantity = useCartStore((s) => s.setQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const [loading, setLoading] = useState(false)

  if (items.length === 0) {
    return <EmptyState title="Panier vide" description="Ajoute un produit depuis la boutique." />
  }

  const total = cartTotalCents(items)

  async function handleCheckout() {
    setLoading(true)
    try {
      await startCheckout(items[0].artistId, items)
    } catch {
      toast('Le paiement a échoué. Réessaie.', 'error')
      setLoading(false)
    }
  }

  return (
    <div className="px-4 pt-6">
      <h1 className="font-display text-2xl tracking-wide">Panier</h1>

      <div className="mt-4 flex flex-col gap-3">
        {items.map((item) => (
          <div key={item.variantId} className="flex items-center gap-3">
            <div className="size-16 shrink-0 overflow-hidden rounded-md bg-black/10">
              {item.imageUrl && <img src={item.imageUrl} alt="" className="size-full object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{item.title}</p>
              <p className="text-xs text-black/50">{item.variantLabel}</p>
              <div className="mt-1 flex items-center gap-2">
                <button
                  onClick={() => setQuantity(item.variantId, item.quantity - 1)}
                  className="size-6 rounded-full border border-black/25 text-xs"
                >
                  −
                </button>
                <span className="text-sm">{item.quantity}</span>
                <button
                  onClick={() => setQuantity(item.variantId, item.quantity + 1)}
                  className="size-6 rounded-full border border-black/25 text-xs"
                >
                  +
                </button>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <p className="text-sm">{formatMoney(item.unitPriceCents * item.quantity)}</p>
              <button onClick={() => removeItem(item.variantId)} className="text-xs text-black/40 hover:text-black/70">
                Retirer
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-black/10 pt-4">
        <span className="text-sm text-black/60">Total</span>
        <span className="text-lg font-medium">{formatMoney(total)}</span>
      </div>

      <Button className="mt-4 w-full" loading={loading} onClick={handleCheckout}>
        Payer
      </Button>
    </div>
  )
}
