import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { storage } from './storage'

/** Uploads a file to Storage at the given path and returns its public download URL. */
export async function uploadArtistFile(path: string, file: File): Promise<string> {
  const fileRef = ref(storage, path)
  await uploadBytes(fileRef, file, { contentType: file.type })
  return getDownloadURL(fileRef)
}

function extensionOf(file: File): string {
  const fromName = file.name.split('.').pop()
  if (fromName && fromName.length <= 5) return fromName
  return file.type.split('/').pop() || 'bin'
}

export function artistTrackPath(artistId: string, trackId: string, kind: 'artwork' | 'audio', file: File) {
  return `artists/${artistId}/tracks/${trackId}/${kind}.${extensionOf(file)}`
}

export function artistAlbumPath(artistId: string, albumId: string, file: File) {
  return `artists/${artistId}/albums/${albumId}/artwork.${extensionOf(file)}`
}

export function artistProductPath(artistId: string, productId: string, index: number, file: File) {
  return `artists/${artistId}/products/${productId}/image-${index}.${extensionOf(file)}`
}

/** Reads an audio file's duration locally (no upload needed) via a throwaway <audio> element. */
export function readAudioDurationSeconds(file: File): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const audio = new Audio(url)
    audio.addEventListener('loadedmetadata', () => {
      URL.revokeObjectURL(url)
      resolve(Number.isFinite(audio.duration) ? Math.round(audio.duration) : 0)
    })
    audio.addEventListener('error', () => {
      URL.revokeObjectURL(url)
      resolve(0)
    })
  })
}
