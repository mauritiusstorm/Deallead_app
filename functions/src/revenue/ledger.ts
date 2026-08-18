import { FieldValue, type Firestore } from 'firebase-admin/firestore'
import { calculateRevenueSplit, type RevenueSource, type RevenueSplitConfigSnapshot } from '../shared/money.js'

export interface RecordTransactionInput {
  artistId: string
  source: RevenueSource
  externalReference: string
  grossAmountCents: number
  currency: string
  feesCents: number
  splitConfig: RevenueSplitConfigSnapshot
  /** Stripe event id (or another caller-chosen stable key) — enforces idempotency. */
  idempotencyKey: string
}

/**
 * Idempotently records one immutable revenue transaction plus its splits.
 * Safe to call multiple times with the same `idempotencyKey` (Stripe
 * webhooks routinely redeliver) — a repeat call is a silent no-op.
 */
export async function recordRevenueTransaction(db: Firestore, input: RecordTransactionInput): Promise<void> {
  const existing = await db
    .collection('revenueTransactions')
    .where('idempotencyKey', '==', input.idempotencyKey)
    .limit(1)
    .get()
  if (!existing.empty) return

  const split = calculateRevenueSplit(input.grossAmountCents, input.feesCents, input.source, input.splitConfig)

  const txRef = db.collection('revenueTransactions').doc()
  const batch = db.batch()

  batch.set(txRef, {
    artistId: input.artistId,
    source: input.source,
    externalReference: input.externalReference,
    grossAmountCents: input.grossAmountCents,
    currency: input.currency,
    feesCents: input.feesCents,
    netBeforeSplitCents: split.netBeforeSplitCents,
    artistShareCents: split.artistShareCents,
    teamShareCents: split.teamShareCents,
    platformShareCents: split.platformShareCents,
    finalNetCents: split.finalNetCents,
    splitConfigVersion: input.splitConfig.version,
    status: 'settled',
    idempotencyKey: input.idempotencyKey,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })

  const artistSplitRef = db.collection('revenueSplits').doc()
  batch.set(artistSplitRef, {
    revenueTransactionId: txRef.id,
    beneficiaryType: 'artist',
    beneficiaryId: input.artistId,
    percentage: input.grossAmountCents > 0 ? (split.artistShareCents / split.netBeforeSplitCents) * 100 : 0,
    amountCents: split.artistShareCents,
    currency: input.currency,
    status: 'pending',
  })

  const platformSplitRef = db.collection('revenueSplits').doc()
  batch.set(platformSplitRef, {
    revenueTransactionId: txRef.id,
    beneficiaryType: 'platform',
    beneficiaryId: 'platform',
    percentage: input.grossAmountCents > 0 ? (split.platformShareCents / split.netBeforeSplitCents) * 100 : 0,
    amountCents: split.platformShareCents,
    currency: input.currency,
    status: 'paid',
  })

  await batch.commit()
}
