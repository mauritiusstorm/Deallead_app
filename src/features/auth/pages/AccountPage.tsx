import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Card } from '@/components/ui'
import { useAuthStore } from '../store'
import { signOutUser } from '../api'
import { THE_ARTIST_SLUG } from '@/config/artist'
import { useArtistBySlug } from '@/features/artists/hooks/useArtistBySlug'
import { useArtistMembership } from '@/features/artists/hooks/useArtistMembership'

const LINKS = [
  { to: '/account/orders', label: 'Commandes' },
  { to: '/account/tickets', label: 'Billets' },
  { to: '/library/favorites', label: 'Favoris' },
  { to: '/library/history', label: 'Historique' },
  { to: '/notifications', label: 'Notifications' },
  { to: '/settings', label: 'Paramètres' },
]

export default function AccountPage() {
  const { t } = useTranslation()
  const profile = useAuthStore((s) => s.profile)
  const { artist } = useArtistBySlug(THE_ARTIST_SLUG)
  const { membership } = useArtistMembership(artist?.id)

  return (
    <div className="px-4 pt-6">
      <h1 className="font-display text-2xl tracking-wide">{t('nav.account')}</h1>
      <Card className="mt-4 flex items-center gap-3">
        <div className="size-14 shrink-0 overflow-hidden rounded-full bg-white/10">
          {profile?.photoUrl && <img src={profile.photoUrl} alt="" className="size-full object-cover" />}
        </div>
        <div>
          <p className="font-medium">{profile?.displayName ?? '…'}</p>
          <p className="text-sm text-white/50">{profile?.email}</p>
        </div>
      </Card>

      <div className="mt-4 flex flex-col divide-y divide-white/10 rounded-lg border border-white/10">
        {LINKS.map((link) => (
          <Link key={link.to} to={link.to} className="px-4 py-3 text-sm hover:bg-white/5">
            {link.label}
          </Link>
        ))}
      </div>

      {membership && artist && (
        <Link key="artist-dashboard" to={`/artist/${artist.id}`}>
          <Button variant="secondary" className="mt-6 w-full">
            Espace artiste
          </Button>
        </Link>
      )}

      <Button variant="secondary" className="mt-6 w-full" onClick={() => void signOutUser()}>
        {t('actions.logout')}
      </Button>
    </div>
  )
}
