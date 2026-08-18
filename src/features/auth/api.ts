import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

const googleProvider = new GoogleAuthProvider()

export async function signUpWithEmail(email: string, password: string, displayName: string) {
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(credential.user, { displayName })
  await createUserProfile(credential.user.uid, { displayName, email })
  await sendEmailVerification(credential.user)
  return credential.user
}

export async function signInWithEmail(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password)
  return credential.user
}

export async function signInWithGoogle() {
  const credential = await signInWithPopup(auth, googleProvider)
  await createUserProfile(credential.user.uid, {
    displayName: credential.user.displayName ?? 'Fan',
    email: credential.user.email ?? '',
  })
  return credential.user
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email)
}

export async function signOutUser() {
  await signOut(auth)
}

/** Idempotent — merge so re-auth (e.g. Google after email signup) never clobbers the profile. */
async function createUserProfile(userId: string, data: { displayName: string; email: string }) {
  await setDoc(
    doc(db, 'users', userId),
    {
      displayName: data.displayName,
      email: data.email,
      emailVerified: false,
      photoUrl: null,
      locale: 'fr',
      notificationPreferences: { global: true, music: true, merch: true, events: true, account: true },
      onboardingCompleted: false,
      deletedAt: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
}
