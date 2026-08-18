import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { z } from 'zod'
import { db } from '../shared/admin.js'
import { getStripe, stripeSecretKey } from './client.js'

const inputSchema = z.object({ artistId: z.string(), returnUrl: z.string().url(), refreshUrl: z.string().url() })

export const createConnectOnboardingLink = onCall(
  { secrets: [stripeSecretKey], region: 'europe-west1' },
  async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in required.')
    const input = inputSchema.parse(request.data)

    const membershipSnap = await db.doc(`artistMembers/${input.artistId}_${request.auth.uid}`).get()
    const role = membershipSnap.get('role')
    if (!membershipSnap.exists || !['owner', 'admin'].includes(role)) {
      throw new HttpsError('permission-denied', 'Only an artist owner/admin can start Stripe onboarding.')
    }

    const artistRef = db.doc(`artists/${input.artistId}`)
    const artistSnap = await artistRef.get()
    let accountId = artistSnap.get('stripeConnectAccountId') as string | null

    if (!accountId) {
      const account = await getStripe().accounts.create({ type: 'express', metadata: { artistId: input.artistId } })
      accountId = account.id
      await artistRef.update({ stripeConnectAccountId: accountId, stripeConnectOnboardingStatus: 'pending' })
    }

    const link = await getStripe().accountLinks.create({
      account: accountId,
      type: 'account_onboarding',
      return_url: input.returnUrl,
      refresh_url: input.refreshUrl,
    })

    return { url: link.url }
  },
)
