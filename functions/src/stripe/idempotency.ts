import { FieldValue, type Firestore } from 'firebase-admin/firestore'

/**
 * Stripe redelivers webhook events on any non-2xx response, or after
 * network hiccups on our side — so every event id is recorded here and
 * checked before it's processed. Returns false when the event was
 * already handled (caller should skip processing and return 200).
 */
export async function claimStripeEvent(db: Firestore, eventId: string, type: string): Promise<boolean> {
  const ref = db.collection('processedStripeEvents').doc(eventId)
  return db.runTransaction(async (tx) => {
    const snapshot = await tx.get(ref)
    if (snapshot.exists) return false
    tx.set(ref, { type, processedAt: FieldValue.serverTimestamp() })
    return true
  })
}
