import { isSupported, getMessaging, type Messaging } from 'firebase/messaging'
import { firebaseApp } from './app'

let messagingPromise: Promise<Messaging | null> | null = null

/**
 * FCM is unavailable in some contexts (Safari without a service worker,
 * unsupported browsers) — always resolve through this guarded accessor
 * rather than calling getMessaging() directly.
 */
export function getMessagingIfSupported(): Promise<Messaging | null> {
  if (!messagingPromise) {
    messagingPromise = isSupported().then((supported) => (supported ? getMessaging(firebaseApp) : null))
  }
  return messagingPromise
}
