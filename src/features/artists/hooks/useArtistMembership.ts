import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuthStore } from '@/features/auth/store'
import type { ArtistMember } from '@/types'

/** Composite-ID doc (`{artistId}_{userId}`) — a direct get/listen, matching firestore.rules (get-only, no list). */
export function useArtistMembership(artistId: string | undefined) {
  const userId = useAuthStore((s) => s.firebaseUser?.uid)
  const [membership, setMembership] = useState<ArtistMember | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!artistId || !userId) {
      setMembership(null)
      setLoading(false)
      return
    }
    setLoading(true)
    const unsubscribe = onSnapshot(doc(db, 'artistMembers', `${artistId}_${userId}`), (snapshot) => {
      const data = snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as ArtistMember) : null
      setMembership(data && data.status === 'active' ? data : null)
      setLoading(false)
    })
    return unsubscribe
  }, [artistId, userId])

  return { membership, loading }
}
