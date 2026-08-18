import { useNavigate } from 'react-router-dom'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Button } from '@/components/ui'
import { useAuthStore } from '../store'

export default function OnboardingPage() {
  const navigate = useNavigate()
  const userId = useAuthStore((s) => s.firebaseUser?.uid)

  async function complete() {
    if (!userId) return
    await setDoc(doc(db, 'users', userId), { onboardingCompleted: true, updatedAt: serverTimestamp() }, { merge: true })
    navigate('/')
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-sm flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="font-display text-3xl tracking-wide">Bienvenue.</h1>
      <p className="text-sm text-black/60">
        Découvre tes artistes préférés, suis-les, et débloque du contenu exclusif.
      </p>
      <Button onClick={complete} className="w-full">
        Commencer
      </Button>
    </div>
  )
}
