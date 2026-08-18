import { THE_ARTIST_SLUG } from '@/config/artist'
import { useArtistBySlug } from '@/features/artists/hooks/useArtistBySlug'
import { Button, Skeleton, ErrorState, EmptyState } from '@/components/ui'
import { PageHeader } from '@/components/PageHeader'
import { CrownIcon } from '@/components/icons'
import { toast } from '@/components/ui/toastStore'

const BENEFITS = ['Contenu exclusif', 'Avant-premières', 'Réductions boutique', 'Accès aux événements']

export default function FanClubPage() {
  const { artist, loading, error } = useArtistBySlug(THE_ARTIST_SLUG)

  if (loading) {
    return (
      <div className="px-4 pt-6">
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
    )
  }

  if (error) return <ErrorState />
  if (!artist) return <EmptyState title="Artiste introuvable" />

  return (
    <div className="pb-6">
      <PageHeader title="Fan Club" />

      <div className="relative mt-4 aspect-[16/9] w-full overflow-hidden">
        {artist.coverUrl && <img src={artist.coverUrl} alt="" className="absolute inset-0 size-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/30 to-transparent" />
      </div>

      <div className="flex flex-col items-center gap-3 px-6 pt-6 text-center">
        <CrownIcon className="size-8" />
        <h1 className="font-display text-2xl tracking-wide">{artist.name} FAMILY</h1>

        <ul className="mt-2 flex w-full max-w-xs flex-col gap-2 text-left text-sm text-white/70">
          {BENEFITS.map((benefit) => (
            <li key={benefit} className="flex items-center gap-2">
              <span className="text-blanc">✓</span>
              {benefit}
            </li>
          ))}
        </ul>

        <Button
          className="mt-4 w-full max-w-xs"
          onClick={() => toast('Les abonnements arrivent bientôt.', 'default')}
        >
          Rejoindre
        </Button>
      </div>
    </div>
  )
}
