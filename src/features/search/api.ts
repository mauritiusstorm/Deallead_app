import { collection, endAt, getDocs, orderBy, query, startAt, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Artist } from '@/types'

/**
 * MVP search: a Firestore prefix-range query on `nameLower`. Good enough
 * at pilot-artist scale; swap this module for Algolia/Typesense/Meilisearch
 * later without touching call sites (same `searchArtists` signature).
 */
export async function searchArtists(term: string): Promise<Artist[]> {
  const normalized = term.toLowerCase()
  const q = query(
    collection(db, 'artists'),
    where('status', '==', 'published'),
    orderBy('nameLower'),
    startAt(normalized),
    endAt(normalized + ''),
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Artist)
}
