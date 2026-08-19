import { useState } from 'react'
import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { artistAlbumPath, uploadArtistFile } from '@/lib/firebase/upload'
import type { Album } from '@/types'

export function useCreateAlbum(artistId: string, userId: string | undefined) {
  const [saving, setSaving] = useState(false)

  async function createAlbum(input: { title: string; type: Album['type']; artworkFile: File | null }) {
    if (!userId) throw new Error('not_signed_in')
    setSaving(true)
    try {
      const albumRef = doc(collection(db, 'albums'))
      const artworkUrl = input.artworkFile
        ? await uploadArtistFile(artistAlbumPath(artistId, albumRef.id, input.artworkFile), input.artworkFile)
        : null

      await setDoc(albumRef, {
        artistId,
        title: input.title,
        type: input.type,
        artworkUrl,
        status: 'published',
        releaseDate: serverTimestamp(),
        trackCount: 0,
        createdBy: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      return albumRef.id
    } finally {
      setSaving(false)
    }
  }

  return { createAlbum, saving }
}
