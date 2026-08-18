import { initializeFirestore, connectFirestoreEmulator, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'
import { firebaseApp } from './app'
import { useEmulators } from './config'

export const db = initializeFirestore(firebaseApp, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
})

if (useEmulators) {
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
}
