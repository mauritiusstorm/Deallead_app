import { useEffect, useState } from 'react'
import { collection, doc, getDoc, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Product, ProductVariant } from '@/types'

export function useProduct(productId: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null)
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!productId) return
    let cancelled = false
    setLoading(true)
    Promise.all([getDoc(doc(db, 'products', productId)), getDocs(collection(db, 'products', productId, 'variants'))])
      .then(([productSnap, variantsSnap]) => {
        if (cancelled) return
        setProduct(productSnap.exists() ? ({ id: productSnap.id, ...productSnap.data() } as Product) : null)
        setVariants(variantsSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as ProductVariant))
      })
      .catch(() => !cancelled && setError('load_failed'))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [productId])

  return { product, variants, loading, error }
}
