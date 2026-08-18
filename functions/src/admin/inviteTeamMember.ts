import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { FieldValue } from 'firebase-admin/firestore'
import { randomBytes } from 'node:crypto'
import { z } from 'zod'
import { db } from '../shared/admin.js'

const inputSchema = z.object({
  artistId: z.string(),
  email: z.string().email(),
  role: z.enum(['admin', 'manager', 'editor', 'finance', 'viewer']),
})

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000

export const inviteTeamMember = onCall({ region: 'europe-west1' }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in required.')
  const input = inputSchema.parse(request.data)

  const membershipSnap = await db.doc(`artistMembers/${input.artistId}_${request.auth.uid}`).get()
  const role = membershipSnap.get('role')
  if (!membershipSnap.exists || !['owner', 'admin'].includes(role)) {
    throw new HttpsError('permission-denied', 'Only an owner/admin can invite team members.')
  }

  const token = randomBytes(24).toString('hex')
  const inviteRef = db.collection('artistInvites').doc()
  await inviteRef.set({
    artistId: input.artistId,
    email: input.email,
    role: input.role,
    token,
    status: 'pending',
    invitedBy: request.auth.uid,
    createdAt: FieldValue.serverTimestamp(),
    expiresAt: new Date(Date.now() + INVITE_TTL_MS),
  })

  // TODO(Phase 6): send the invite email (e.g. via a transactional email
  // provider) containing a link to /invite/accept?token=<token>.

  return { inviteId: inviteRef.id }
})
