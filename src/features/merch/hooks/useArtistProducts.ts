import { useEffect, useState } from 'react'
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Product } from '@/types'

export function useArtistProducts(artistId: string | undefined, max = 50) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!artistId) return
    let cancelled = false
    setLoading(true)
    const q = query(
      collection(db, 'products'),
      where('artistId', '==', artistId),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      limit(max),
    )
    getDocs(q)
      .then((snapshot) => {
        if (cancelled) return
        setProducts(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Product))
      })
      .catch(() => !cancelled && setError('load_failed'))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [artistId, max])

  return { products, loading, error }
}
