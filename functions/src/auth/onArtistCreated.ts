import { onDocumentCreated } from 'firebase-functions/v2/firestore'
import { FieldValue } from 'firebase-admin/firestore'
import { db } from '../shared/admin.js'

/**
 * Grants the creating user an `owner` membership the moment an artist
 * profile is created. Runs with the Admin SDK, so it is the one place
 * allowed to write `artistMembers` for a brand-new artist — the
 * Security Rules deny direct client writes to that collection entirely.
 */
export const onArtistCreated = onDocumentCreated('artists/{artistId}', async (event) => {
  const snapshot = event.data
  if (!snapshot) return
  const artist = snapshot.data()
  const artistId = event.params.artistId as string

  await db.doc(`artistMembers/${artistId}_${artist.createdBy}`).set({
    artistId,
    userId: artist.createdBy,
    role: 'owner',
    invitedBy: null,
    status: 'active',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })
})
