import { onRequest } from 'firebase-functions/v2/https'
import { logger } from 'firebase-functions/v2'
import { db } from '../shared/admin.js'
import { getStripe, stripeSecretKey, stripeWebhookSecret } from './client.js'
import { claimStripeEvent } from './idempotency.js'
import { recordRevenueTransaction } from '../revenue/ledger.js'
import type Stripe from 'stripe'

/**
 * Single entry point for all Stripe webhook traffic (Checkout, Billing,
 * Connect). Runs raw-body signature verification, then idempotently
 * dispatches to the relevant handler. Deliberately does very little
 * inline — each event type's business logic lives in its own module so
 * this file stays a router.
 */
export const stripeWebhook = onRequest(
  { secrets: [stripeSecretKey, stripeWebhookSecret], region: 'europe-west1' },
  async (req, res) => {
    const signature = req.headers['stripe-signature']
    if (!signature || typeof signature !== 'string') {
      res.status(400).send('Missing signature')
      return
    }

    let event: Stripe.Event
    try {
      event = getStripe().webhooks.constructEvent(req.rawBody, signature, stripeWebhookSecret.value())
    } catch (error) {
      logger.warn('stripe webhook signature verification failed', error)
      res.status(400).send('Invalid signature')
      return
    }

    const isNewEvent = await claimStripeEvent(db, event.id, event.type)
    if (!isNewEvent) {
      res.status(200).send('already processed')
      return
    }

    try {
      await dispatch(event)
      res.status(200).send('ok')
    } catch (error) {
      logger.error('stripe webhook handler failed', { type: event.type, error })
      // A 5xx tells Stripe to retry; the idempotency claim above ensures a
      // retry after a partial failure is safe.
      res.status(500).send('handler error')
    }
  },
)

async function dispatch(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
      return
    case 'invoice.paid':
      await handleInvoicePaid(event.data.object as Stripe.Invoice)
      return
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      await handleSubscriptionChanged(event.data.object as Stripe.Subscription)
      return
    default:
      logger.info('unhandled stripe event type', event.type)
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const orderId = session.metadata?.orderId
  const artistId = session.metadata?.artistId
  if (!orderId || !artistId) {
    logger.warn('checkout.session.completed missing orderId/artistId metadata', session.id)
    return
  }

  const artistSnap = await db.doc(`artists/${artistId}`).get()
  const splitConfig = artistSnap.get('activeRevenueSplitConfig')
  if (!splitConfig) {
    logger.error('artist missing activeRevenueSplitConfig', artistId)
    return
  }

  await db.doc(`orders/${orderId}`).update({ status: 'paid', stripePaymentIntentId: session.payment_intent })

  await recordRevenueTransaction(db, {
    artistId,
    source: 'merchandise',
    externalReference: session.id,
    grossAmountCents: session.amount_total ?? 0,
    currency: (session.currency ?? 'eur').toUpperCase(),
    feesCents: 0, // Stripe fees are reconciled from the balance transaction in a follow-up job.
    splitConfig,
    idempotencyKey: `checkout_session_${session.id}`,
  })
}

async function handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
  const artistId = invoice.parent?.subscription_details?.metadata?.artistId
  if (!artistId) {
    logger.warn('invoice.paid missing artistId metadata', invoice.id)
    return
  }

  const artistSnap = await db.doc(`artists/${artistId}`).get()
  const splitConfig = artistSnap.get('activeRevenueSplitConfig')
  if (!splitConfig) return

  await recordRevenueTransaction(db, {
    artistId,
    source: 'subscription',
    externalReference: invoice.id,
    grossAmountCents: invoice.amount_paid,
    currency: invoice.currency.toUpperCase(),
    feesCents: 0,
    splitConfig,
    idempotencyKey: `invoice_${invoice.id}`,
  })
}

async function handleSubscriptionChanged(subscription: Stripe.Subscription): Promise<void> {
  const userId = subscription.metadata?.userId
  const artistId = subscription.metadata?.artistId
  if (!userId || !artistId) return

  await db.doc(`subscriptions/${userId}_${artistId}`).set(
    {
      status: subscription.status,
      currentPeriodEnd: subscription.items.data[0]?.current_period_end
        ? new Date(subscription.items.data[0].current_period_end * 1000)
        : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
    { merge: true },
  )
}
