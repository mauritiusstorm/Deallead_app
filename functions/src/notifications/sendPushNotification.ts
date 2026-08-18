import { getMessaging } from 'firebase-admin/messaging'
import { FieldValue } from 'firebase-admin/firestore'
import { db } from '../shared/admin.js'
import type { Firestore } from 'firebase-admin/firestore'

export interface NotifyInput {
  userId: string
  category: 'music' | 'merch' | 'events' | 'account'
  title: string
  body: string
  deepLink?: string
}

/**
 * Writes the in-app notification doc, then best-effort pushes to every
 * FCM token on file for the user (skipping the category if the user has
 * opted out). A dead/invalid token is pruned rather than treated as an error.
 */
export async function notifyUser(input: NotifyInput, firestore: Firestore = db): Promise<void> {
  const userSnap = await firestore.doc(`users/${input.userId}`).get()
  const prefs = userSnap.get('notificationPreferences')
  if (prefs && (prefs.global === false || prefs[input.category] === false)) return

  await firestore.collection('notifications').add({
    userId: input.userId,
    category: input.category,
    title: input.title,
    body: input.body,
    deepLink: input.deepLink ?? null,
    read: false,
    createdAt: FieldValue.serverTimestamp(),
  })

  const tokensSnap = await firestore.collection('fcmTokens').where('userId', '==', input.userId).get()
  if (tokensSnap.empty) return

  const tokens = tokensSnap.docs.map((d) => d.get('token') as string)
  const response = await getMessaging().sendEachForMulticast({
    tokens,
    notification: { title: input.title, body: input.body },
    data: input.deepLink ? { deepLink: input.deepLink } : undefined,
  })

  await Promise.all(
    response.responses.map((r, i) => {
      if (r.success || !isInvalidTokenError(r.error?.code)) return Promise.resolve()
      return tokensSnap.docs[i].ref.delete()
    }),
  )
}

function isInvalidTokenError(code: string | undefined): boolean {
  return code === 'messaging/invalid-registration-token' || code === 'messaging/registration-token-not-registered'
}
