import { getFunctions, connectFunctionsEmulator } from 'firebase/functions'
import { firebaseApp } from './app'
import { useEmulators } from './config'

export const functions = getFunctions(firebaseApp, 'europe-west1')

if (useEmulators) {
  connectFunctionsEmulator(functions, '127.0.0.1', 5001)
}
