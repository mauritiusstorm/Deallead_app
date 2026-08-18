import { useState } from 'react'
import { Link } from 'react-router-dom'
import { THE_ARTIST_SLUG } from '@/config/artist'
import { useArtistBySlug } from '@/features/artists/hooks/useArtistBySlug'
import { useArtistTracks } from '@/features/music/hooks/useArtistTracks'
import { useFollow } from '@/features/artists/hooks/useFollow'
import { useArtistMembership } from '@/features/artists/hooks/useArtistMembership'
import { Button, Skeleton, ErrorState, EmptyState } from '@/components/ui'
import { BackIcon, MoreIcon } from '@/components/icons'
import { formatCompactNumber } from '@/lib/money'

export default function AccountPage() {
  const { artist, loading, error } = useArtistBySlug(THE_ARTIST_SLUG)
  const { tracks } = useArtistTracks(artist?.id)
  const { isFollowing, toggle: toggleFollow } = useFollow(artist?.id)
  const { membership } = useArtistMembership(artist?.id)
  const [bioExpanded, setBioExpanded] = useState(false)

  if (loading) {
    return (
      <div className="px-4 pt-6">
        <Skeleton className="mx-auto size-24 rounded-full" />
        <Skeleton className="mx-auto mt-4 h-6 w-40" />
      </div>
    )
  }

  if (error) return <ErrorState />
  if (!artist) return <EmptyState title="Artiste introuvable" />

  const streams = tracks.reduce((sum, t) => sum + t.playCount, 0)
  const bio = artist.bio
  const bioIsLong = bio.length > 120

  return (
    <div className="px-4 pb-6 pt-4">
      <header className="flex items-center justify-between">
        <Link to=".." aria-label="Retour" className="p-1 text-black/70 hover:text-noir">
          <BackIcon className="size-5" />
        </Link>
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-black/50">Profil</span>
        <Link to="/settings" aria-label="Réglages" className="p-1 text-black/70 hover:text-noir">
          <MoreIcon className="size-5" />
        </Link>
      </header>

      <div className="mt-6 flex flex-col items-center gap-3 text-center">
        <div className="size-24 overflow-hidden rounded-full bg-black/10">
          {artist.avatarUrl && <img src={artist.avatarUrl} alt={artist.name} className="size-full object-cover" />}
        </div>
        <h1 className="font-display text-2xl tracking-wide">{artist.name}</h1>

        <div className="flex gap-8">
          <div className="text-center">
            <p className="font-display text-xl">{tracks.length}</p>
            <p className="text-[11px] uppercase tracking-wider text-black/40">Sorties</p>
          </div>
          <div className="text-center">
            <p className="font-display text-xl">{formatCompactNumber(artist.followerCount)}</p>
            <p className="text-[11px] uppercase tracking-wider text-black/40">Auditeurs</p>
          </div>
          <div className="text-center">
            <p className="font-display text-xl">{formatCompactNumber(streams)}</p>
            <p className="text-[11px] uppercase tracking-wider text-black/40">Streams</p>
          </div>
        </div>

        <Button
          variant={isFollowing ? 'secondary' : 'primary'}
          size="sm"
          onClick={() => void toggleFollow()}
          className="mt-1 min-w-32"
        >
          {isFollowing ? 'Abonné' : 'Suivre'}
        </Button>
      </div>

      <section className="mt-8">
        <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-black/50">À propos</h2>
        <p className="mt-2 text-sm text-black/70">
          {bioIsLong && !bioExpanded ? `${bio.slice(0, 120)}…` : bio}
        </p>
        {bioIsLong && (
          <button onClick={() => setBioExpanded((v) => !v)} className="mt-1 text-xs text-black/40 hover:text-black/70">
            {bioExpanded ? 'Voir moins' : 'Voir plus'}
          </button>
        )}
      </section>

      {membership && (
        <Link to={`/artist/${artist.id}`}>
          <Button variant="secondary" className="mt-8 w-full">
            Espace artiste
          </Button>
        </Link>
      )}
    </div>
  )
}
