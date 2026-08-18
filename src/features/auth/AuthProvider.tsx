import { useEffect, type ReactNode } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { useAuthStore } from './store'
import type { User } from '@/types'

export function AuthProvider({ children }: { children: ReactNode }) {
  const setAuth = useAuthStore((s) => s.setAuth)
  const setProfile = useAuthStore((s) => s.setProfile)
  const userId = useAuthStore((s) => s.firebaseUser?.uid)

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setAuth(null, null)
        setProfile(null)
        return
      }
      const tokenResult = await firebaseUser.getIdTokenResult()
      setAuth(firebaseUser, tokenResult.claims)
    })
    return unsubscribeAuth
  }, [setAuth, setProfile])

  useEffect(() => {
    if (!userId) return
    const unsubscribeProfile = onSnapshot(doc(db, 'users', userId), (snapshot) => {
      setProfile(snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as User) : null)
    })
    return unsubscribeProfile
  }, [userId, setProfile])

  return children
}
