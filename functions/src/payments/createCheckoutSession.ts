import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { FieldValue } from 'firebase-admin/firestore'
import { z } from 'zod'
import { db } from '../shared/admin.js'
import { getStripe, stripeSecretKey } from '../stripe/client.js'

const inputSchema = z.object({
  artistId: z.string(),
  items: z.array(z.object({ productId: z.string(), variantId: z.string(), quantity: z.number().int().min(1) })).min(1),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
})

/**
 * Server-side "destination charge" model: the platform account owns the
 * PaymentIntent and later transfers `artistShareCents` to the artist's
 * connected Stripe account via `recordRevenueTransaction` + a scheduled
 * payout job — simpler to reconcile for the MVP than per-item
 * separate-charges-and-transfers. See ARCHITECTURE.md §Stripe.
 */
export const createCheckoutSession = onCall({ secrets: [stripeSecretKey], region: 'europe-west1' }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in required.')
  const input = inputSchema.parse(request.data)

  const lineItems = await Promise.all(
    input.items.map(async (item) => {
      const variantSnap = await db.doc(`products/${item.productId}/variants/${item.variantId}`).get()
      if (!variantSnap.exists) throw new HttpsError('not-found', `Variant ${item.variantId} not found`)
      const variant = variantSnap.data() as { priceCents: number; label: string; stockQuantity: number }
      if (variant.stockQuantity < item.quantity) throw new HttpsError('failed-precondition', 'Insufficient stock')
      return {
        price_data: {
          currency: 'eur',
          unit_amount: variant.priceCents,
          product_data: { name: variant.label },
        },
        quantity: item.quantity,
      }
    }),
  )

  const orderRef = db.collection('orders').doc()
  await orderRef.set({
    userId: request.auth.uid,
    artistId: input.artistId,
    status: 'pending_payment',
    currency: 'EUR',
    subtotalCents: 0,
    shippingCents: 0,
    discountCents: 0,
    totalCents: 0,
    promoCodeId: null,
    stripePaymentIntentId: null,
    stripeCheckoutSessionId: null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })

  const session = await getStripe().checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    metadata: { orderId: orderRef.id, artistId: input.artistId },
  })

  await orderRef.update({ stripeCheckoutSessionId: session.id })

  return { checkoutUrl: session.url, orderId: orderRef.id }
})
