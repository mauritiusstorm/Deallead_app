import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Album } from '@/types'

export function useAlbum(albumId: string | undefined) {
  const [album, setAlbum] = useState<Album | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!albumId) return
    let cancelled = false
    setLoading(true)
    getDoc(doc(db, 'albums', albumId))
      .then((snapshot) => {
        if (cancelled) return
        setAlbum(snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as Album) : null)
      })
      .catch(() => !cancelled && setError('load_failed'))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [albumId])

  return { album, loading, error }
}
