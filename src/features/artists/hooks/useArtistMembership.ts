import { useEffect, useState } from 'react'
import { collection, query, where, limit, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuthStore } from '@/features/auth/store'
import type { ArtistMember } from '@/types'

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
    const q = query(
      collection(db, 'artistMembers'),
      where('artistId', '==', artistId),
      where('userId', '==', userId),
      where('status', '==', 'active'),
      limit(1),
    )
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const first = snapshot.docs[0]
      setMembership(first ? ({ id: first.id, ...first.data() } as ArtistMember) : null)
      setLoading(false)
    })
    return unsubscribe
  }, [artistId, userId])

  return { membership, loading }
}
