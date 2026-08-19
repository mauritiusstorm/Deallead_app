import { useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store'
import { useArtistAlbums } from '../../hooks/useArtistAlbums'
import { useCreateTrack } from '../../hooks/useCreateTrack'
import { Button, Input } from '@/components/ui'
import { toast } from '@/components/ui/toastStore'

export default function NewTrackPage() {
  const { artistId } = useParams()
  const uid = useAuthStore((s) => s.firebaseUser?.uid)
  const navigate = useNavigate()
  const { albums } = useArtistAlbums(artistId)
  const { createTrack, saving } = useCreateTrack(artistId ?? '', uid)

  const [title, setTitle] = useState('')
  const [albumId, setAlbumId] = useState<string>('')
  const [trackNumber, setTrackNumber] = useState(1)
  const [artworkFile, setArtworkFile] = useState<File | null>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim() || !audioFile) return
    try {
      await createTrack({
        title: title.trim(),
        albumId: albumId || null,
        trackNumber,
        artworkFile,
        audioFile,
      })
      toast('Morceau ajouté.', 'success')
      navigate('..')
    } catch {
      toast('Échec de l’ajout du morceau. Vérifie que Storage est bien activé.', 'error')
    }
  }

  return (
    <div className="max-w-md">
      <h1 className="mb-6 text-xl font-semibold">Nouveau morceau</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Titre" value={title} onChange={(e) => setTitle(e.target.value)} required />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-black/70">Album (optionnel)</label>
          <select
            value={albumId}
            onChange={(e) => setAlbumId(e.target.value)}
            className="h-11 rounded-md border border-black/20 bg-black/5 px-3.5 text-sm text-noir"
          >
            <option value="">Aucun (single)</option>
            {albums.map((album) => (
              <option key={album.id} value={album.id}>
                {album.title}
              </option>
            ))}
          </select>
        </div>

        {albumId && (
          <Input
            label="Numéro de piste"
            type="number"
            min={1}
            value={trackNumber}
            onChange={(e) => setTrackNumber(Number(e.target.value) || 1)}
          />
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-black/70">Pochette (image, optionnel)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setArtworkFile(e.target.files?.[0] ?? null)}
            className="text-sm"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-black/70">Fichier audio</label>
          <input
            type="file"
            accept="audio/*"
            required
            onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
            className="text-sm"
          />
        </div>

        <Button type="submit" loading={saving} disabled={!title.trim() || !audioFile}>
          Publier le morceau
        </Button>
      </form>
    </div>
  )
}
