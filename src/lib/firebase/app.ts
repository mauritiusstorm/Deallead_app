import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import {
  initializeAppCheck,
  ReCaptchaV3Provider,
  type AppCheck,
} from 'firebase/app-check'
import { firebaseConfig, useEmulators } from './config'

declare global {
  // eslint-disable-next-line no-var
  var FIREBASE_APPCHECK_DEBUG_TOKEN: boolean | string | undefined
}

export const firebaseApp: FirebaseApp = getApps()[0] ?? initializeApp(firebaseConfig)

let appCheck: AppCheck | undefined

/**
 * App Check must be initialized before any other Firebase service is used
 * so that Auth/Firestore/Storage/Functions calls carry a valid token.
 * Skipped entirely against the emulator suite (no site key needed there).
 */
export function initAppCheck(): AppCheck | undefined {
  if (appCheck || useEmulators) return appCheck

  const siteKey = import.meta.env.VITE_FIREBASE_APP_CHECK_SITE_KEY
  if (!siteKey) {
    console.warn('[firebase] VITE_FIREBASE_APP_CHECK_SITE_KEY missing — App Check disabled.')
    return undefined
  }

  appCheck = initializeAppCheck(firebaseApp, {
    provider: new ReCaptchaV3Provider(siteKey),
    isTokenAutoRefreshEnabled: true,
  })
  return appCheck
}
