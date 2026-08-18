import { useEffect, useState } from 'react'
import { deleteDoc, doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuthStore } from '@/features/auth/store'

/** Favorites are stored at favorites/{userId}_{trackId} — see firestore.rules. */
export function useFavorite(trackId: string | undefined, artistId: string | undefined) {
  const userId = useAuthStore((s) => s.firebaseUser?.uid)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    if (!userId || !trackId) return
    return onSnapshot(doc(db, 'favorites', `${userId}_${trackId}`), (snapshot) => {
      setIsFavorite(snapshot.exists())
    })
  }, [userId, trackId])

  async function toggle() {
    if (!userId || !trackId || !artistId) return
    const ref = doc(db, 'favorites', `${userId}_${trackId}`)
    if (isFavorite) {
      await deleteDoc(ref)
    } else {
      await setDoc(ref, { userId, trackId, artistId, createdAt: serverTimestamp() })
    }
  }

  return { isFavorite, toggle }
}
