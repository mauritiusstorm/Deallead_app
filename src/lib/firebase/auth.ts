import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { firebaseApp } from './app'
import { useEmulators } from './config'

export const auth = getAuth(firebaseApp)

if (useEmulators) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
}
