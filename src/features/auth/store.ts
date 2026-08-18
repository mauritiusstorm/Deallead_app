import { create } from 'zustand'
import type { User as FirebaseUser } from 'firebase/auth'
import type { User } from '@/types'

interface AuthState {
  firebaseUser: FirebaseUser | null
  profile: User | null
  claims: Record<string, unknown> | null
  status: 'loading' | 'signed-out' | 'signed-in'
  setAuth: (firebaseUser: FirebaseUser | null, claims: Record<string, unknown> | null) => void
  setProfile: (profile: User | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  firebaseUser: null,
  profile: null,
  claims: null,
  status: 'loading',
  setAuth: (firebaseUser, claims) =>
    set({ firebaseUser, claims, status: firebaseUser ? 'signed-in' : 'signed-out' }),
  setProfile: (profile) => set({ profile }),
}))
