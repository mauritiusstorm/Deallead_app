import { useEffect, useState } from 'react'
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Artist } from '@/types'

export function useFeaturedArtists(max = 10) {
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const q = query(
      collection(db, 'artists'),
      where('status', '==', 'published'),
      orderBy('followerCount', 'desc'),
      limit(max),
    )
    getDocs(q)
      .then((snapshot) => {
        if (cancelled) return
        setArtists(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Artist))
      })
      .catch(() => !cancelled && setError('load_failed'))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [max])

  return { artists, loading, error }
}
