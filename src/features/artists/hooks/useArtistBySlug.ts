import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Artist } from '@/types'

/**
 * Single-artist app: the artist document's ID *is* its slug (see
 * functions/scripts/seed.mjs), so this is a direct get() rather than a
 * `where('slug', ...)` query. That's also the pragmatic fix for a real
 * Firestore constraint — a `list` rule can't evaluate `resource.data`
 * fields that aren't part of the query's own filters, so a query
 * filtered on `slug` while the rule checks `status` is denied even when
 * the document matches. A get() by ID has no such restriction.
 */
export function useArtistBySlug(slug: string | undefined) {
  const [artist, setArtist] = useState<Artist | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    setLoading(true)
    getDoc(doc(db, 'artists', slug))
      .then((snapshot) => {
        if (cancelled) return
        setArtist(snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as Artist) : null)
      })
      .catch(() => !cancelled && setError('load_failed'))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [slug])

  return { artist, loading, error }
}
