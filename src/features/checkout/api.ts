import { httpsCallable } from 'firebase/functions'
import { functions } from '@/lib/firebase'
import type { CartItem } from '@/types'

interface CreateCheckoutSessionResponse {
  checkoutUrl: string
  orderId: string
}

/** Redirects the browser to the Stripe-hosted checkout page. */
export async function startCheckout(artistId: string, items: CartItem[]): Promise<void> {
  const call = httpsCallable<
    { artistId: string; items: { productId: string; variantId: string; quantity: number }[]; successUrl: string; cancelUrl: string },
    CreateCheckoutSessionResponse
  >(functions, 'createCheckoutSession')

  const { data } = await call({
    artistId,
    items: items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })),
    successUrl: `${window.location.origin}/checkout/confirmation/{CHECKOUT_SESSION_ID}`,
    cancelUrl: `${window.location.origin}/cart`,
  })

  window.location.href = data.checkoutUrl
}
