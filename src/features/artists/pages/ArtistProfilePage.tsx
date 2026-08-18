import { useParams } from 'react-router-dom'
import { useArtistBySlug } from '../hooks/useArtistBySlug'
import { Button, Skeleton, ErrorState, EmptyState } from '@/components/ui'
import { useTranslation } from 'react-i18next'

export default function ArtistProfilePage() {
  const { slug } = useParams()
  const { artist, loading, error } = useArtistBySlug(slug)
  const { t } = useTranslation()

  if (loading) {
    return (
      <div className="px-4 pt-6">
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="mt-4 h-6 w-1/2" />
      </div>
    )
  }

  if (error) return <ErrorState />
  if (!artist) return <EmptyState title="Artiste introuvable" />

  return (
    <div>
      <div className="relative h-48 w-full bg-white/5">
        {artist.coverUrl && <img src={artist.coverUrl} alt="" className="size-full object-cover" />}
      </div>
      <div className="-mt-10 flex flex-col items-center gap-3 px-4">
        <div className="size-20 overflow-hidden rounded-full border-4 border-noir bg-white/10">
          {artist.avatarUrl && <img src={artist.avatarUrl} alt={artist.name} className="size-full object-cover" />}
        </div>
        <h1 className="font-display text-2xl tracking-wide">{artist.name}</h1>
        <p className="max-w-sm text-center text-sm text-white/60">{artist.bio}</p>
        <Button variant="secondary" size="sm">
          {t('actions.follow')}
        </Button>
      </div>
    </div>
  )
}
