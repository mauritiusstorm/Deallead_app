import { useEffect, useState } from 'react'
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Album } from '@/types'

export function useArtistAlbums(artistId: string | undefined, max = 50) {
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!artistId) return
    let cancelled = false
    setLoading(true)
    const q = query(
      collection(db, 'albums'),
      where('artistId', '==', artistId),
      where('status', '==', 'published'),
      orderBy('releaseDate', 'desc'),
      limit(max),
    )
    getDocs(q)
      .then((snapshot) => {
        if (cancelled) return
        setAlbums(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Album))
      })
      .catch(() => !cancelled && setError('load_failed'))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [artistId, max])

  return { albums, loading, error }
}
