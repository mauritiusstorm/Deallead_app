import { useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store'
import { useCreateAlbum } from '../../hooks/useCreateAlbum'
import { Button, Input } from '@/components/ui'
import { toast } from '@/components/ui/toastStore'

export default function NewAlbumPage() {
  const { artistId } = useParams()
  const uid = useAuthStore((s) => s.firebaseUser?.uid)
  const navigate = useNavigate()
  const { createAlbum, saving } = useCreateAlbum(artistId ?? '', uid)

  const [title, setTitle] = useState('')
  const [type, setType] = useState<'single' | 'ep' | 'album'>('album')
  const [artworkFile, setArtworkFile] = useState<File | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    try {
      await createAlbum({ title: title.trim(), type, artworkFile })
      toast('Album créé.', 'success')
      navigate('..')
    } catch (err) {
      console.error(err)
      const message = err instanceof Error ? err.message : String(err)
      toast(`Échec de la création de l'album : ${message}`, 'error')
    }
  }

  return (
    <div className="max-w-md">
      <h1 className="mb-6 text-xl font-semibold">Nouvel album</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Titre" value={title} onChange={(e) => setTitle(e.target.value)} required />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-black/70">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as typeof type)}
            className="h-11 rounded-md border border-black/20 bg-black/5 px-3.5 text-sm text-noir"
          >
            <option value="album">Album</option>
            <option value="ep">EP</option>
            <option value="single">Single</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-black/70">Pochette (image)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setArtworkFile(e.target.files?.[0] ?? null)}
            className="text-sm"
          />
        </div>

        <Button type="submit" loading={saving} disabled={!title.trim()}>
          Créer l'album
        </Button>
      </form>
    </div>
  )
}
