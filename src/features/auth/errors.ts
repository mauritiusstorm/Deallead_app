import { FirebaseError } from 'firebase/app'

const MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'E-mail ou mot de passe incorrect.',
  'auth/email-already-in-use': 'Un compte existe déjà avec cet e-mail.',
  'auth/weak-password': 'Le mot de passe doit contenir au moins 6 caractères.',
  'auth/invalid-email': "Format d'e-mail invalide.",
  'auth/too-many-requests': 'Trop de tentatives. Réessayez plus tard.',
  'auth/popup-closed-by-user': 'Connexion annulée.',
}

/** Never surface raw Firebase error codes/messages to end users. */
export function mapAuthError(error: unknown): string {
  if (error instanceof FirebaseError) {
    return MESSAGES[error.code] ?? 'Une erreur est survenue. Réessayez.'
  }
  return 'Une erreur est survenue. Réessayez.'
}
