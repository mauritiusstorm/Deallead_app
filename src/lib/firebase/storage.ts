import { getStorage, connectStorageEmulator } from 'firebase/storage'
import { firebaseApp } from './app'
import { useEmulators } from './config'

export const storage = getStorage(firebaseApp)

if (useEmulators) {
  connectStorageEmulator(storage, '127.0.0.1', 9199)
}
