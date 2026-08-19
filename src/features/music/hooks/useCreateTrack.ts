import { useState } from 'react'
import { collection, doc, increment, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { artistTrackPath, readAudioDurationSeconds, uploadArtistFile } from '@/lib/firebase/upload'

export function useCreateTrack(artistId: string, userId: string | undefined) {
  const [saving, setSaving] = useState(false)

  async function createTrack(input: {
    title: string
    albumId: string | null
    trackNumber: number
    artworkFile: File | null
    audioFile: File
  }) {
    if (!userId) throw new Error('not_signed_in')
    setSaving(true)
    try {
      const trackRef = doc(collection(db, 'tracks'))
      const [artworkUrl, audioUrl, durationSeconds] = await Promise.all([
        input.artworkFile
          ? uploadArtistFile(artistTrackPath(artistId, trackRef.id, 'artwork', input.artworkFile), input.artworkFile)
          : Promise.resolve(null),
        uploadArtistFile(artistTrackPath(artistId, trackRef.id, 'audio', input.audioFile), input.audioFile),
        readAudioDurationSeconds(input.audioFile),
      ])

      await setDoc(trackRef, {
        artistId,
        albumId: input.albumId,
        title: input.title,
        durationSeconds,
        trackNumber: input.trackNumber,
        artworkUrl,
        audioStoragePath: audioUrl,
        audioProcessingStatus: 'ready',
        status: 'published',
        releaseDate: serverTimestamp(),
        playCount: 0,
        rightsDeclared: true,
        createdBy: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      if (input.albumId) {
        await updateDoc(doc(db, 'albums', input.albumId), { trackCount: increment(1) })
      }

      return trackRef.id
    } finally {
      setSaving(false)
    }
  }

  return { createTrack, saving }
}
