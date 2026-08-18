import { useEffect, useState } from 'react'
import { collection, getDocs, limit, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Artist } from '@/types'

export function useArtistBySlug(slug: string | undefined) {
  const [artist, setArtist] = useState<Artist | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    setLoading(true)
    const q = query(collection(db, 'artists'), where('slug', '==', slug), limit(1))
    getDocs(q)
      .then((snapshot) => {
        if (cancelled) return
        const first = snapshot.docs[0]
        setArtist(first ? ({ id: first.id, ...first.data() } as Artist) : null)
      })
      .catch(() => !cancelled && setError('load_failed'))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [slug])

  return { artist, loading, error }
}
