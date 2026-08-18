import { useEffect, useState } from 'react'
import { deleteDoc, doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuthStore } from '@/features/auth/store'

/** Follows are stored at follows/{userId}_{artistId} — see firestore.rules. */
export function useFollow(artistId: string | undefined) {
  const userId = useAuthStore((s) => s.firebaseUser?.uid)
  const [isFollowing, setIsFollowing] = useState(false)

  useEffect(() => {
    if (!userId || !artistId) return
    return onSnapshot(doc(db, 'follows', `${userId}_${artistId}`), (snapshot) => {
      setIsFollowing(snapshot.exists())
    })
  }, [userId, artistId])

  async function toggle() {
    if (!userId || !artistId) return
    const ref = doc(db, 'follows', `${userId}_${artistId}`)
    if (isFollowing) {
      await deleteDoc(ref)
    } else {
      await setDoc(ref, { userId, artistId, createdAt: serverTimestamp() })
    }
  }

  return { isFollowing, toggle }
}
