import { useEffect, useState } from 'react'
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Track } from '@/types'

export function useArtistTracks(artistId: string | undefined, max = 50) {
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!artistId) return
    let cancelled = false
    setLoading(true)
    const q = query(
      collection(db, 'tracks'),
      where('artistId', '==', artistId),
      where('status', '==', 'published'),
      orderBy('releaseDate', 'desc'),
      limit(max),
    )
    getDocs(q)
      .then((snapshot) => {
        if (cancelled) return
        setTracks(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Track))
      })
      .catch(() => !cancelled && setError('load_failed'))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [artistId, max])

  return { tracks, loading, error }
}
