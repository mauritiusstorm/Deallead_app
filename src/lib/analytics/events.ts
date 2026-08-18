import { getAnalytics, logEvent, isSupported } from 'firebase/analytics'
import { firebaseApp } from '@/lib/firebase'

let analyticsPromise: Promise<ReturnType<typeof getAnalytics> | null> | null = null

function getAnalyticsIfSupported() {
  if (!analyticsPromise) {
    analyticsPromise = isSupported().then((supported) => (supported ? getAnalytics(firebaseApp) : null))
  }
  return analyticsPromise
}

/** Product/business events (favorites, follows, checkout, subscriptions...) — routed to Firebase Analytics. */
export function trackEvent(name: string, params?: Record<string, unknown>): void {
  void getAnalyticsIfSupported().then((analytics) => {
    if (analytics) logEvent(analytics, name, params)
  })
}
