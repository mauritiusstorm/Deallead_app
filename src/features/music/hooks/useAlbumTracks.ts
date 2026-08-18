import { useEffect, useState } from 'react'
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Track } from '@/types'

export function useAlbumTracks(albumId: string | undefined) {
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!albumId) return
    let cancelled = false
    setLoading(true)
    // `status` must stay in the query filter to match firestore.rules'
    // `allow list` condition — see ARCHITECTURE.md's get-vs-list note.
    const q = query(
      collection(db, 'tracks'),
      where('albumId', '==', albumId),
      where('status', '==', 'published'),
      orderBy('trackNumber'),
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
  }, [albumId])

  return { tracks, loading, error }
}
