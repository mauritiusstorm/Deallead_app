import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../store'
import { signOutUser } from '../api'
import { BackIcon, ChevronRightIcon } from '@/components/icons'

const ACCOUNT_LINKS = [
  { to: '/account/orders', label: 'Commandes' },
  { to: '/account/tickets', label: 'Billets' },
  { to: '/library/favorites', label: 'Favoris' },
  { to: '/library/history', label: 'Historique' },
]

export default function SettingsPage() {
  const { i18n } = useTranslation()
  const profile = useAuthStore((s) => s.profile)

  return (
    <div className="px-4 pb-6 pt-4">
      <header className="flex items-center gap-3">
        <Link to=".." aria-label="Retour" className="p-1 text-white/70 hover:text-blanc">
          <BackIcon className="size-5" />
        </Link>
        <h1 className="text-xs font-medium uppercase tracking-[0.2em] text-white/50">Réglages</h1>
      </header>

      <div className="mt-6 flex flex-col divide-y divide-white/10 rounded-lg border border-white/10">
        {ACCOUNT_LINKS.map((link) => (
          <Link key={link.to} to={link.to} className="flex items-center justify-between px-4 py-3 text-sm hover:bg-white/5">
            {link.label}
            <ChevronRightIcon className="size-4 text-white/30" />
          </Link>
        ))}
      </div>

      <div className="mt-4 flex flex-col divide-y divide-white/10 rounded-lg border border-white/10">
        <div className="flex items-center justify-between px-4 py-3 text-sm">
          <span>Compte</span>
          <span className="text-xs text-white/40">{profile?.email}</span>
        </div>
        <Link to="/fan-club" className="flex items-center justify-between px-4 py-3 text-sm hover:bg-white/5">
          Abonnement
          <span className="text-xs uppercase text-white/40">Free</span>
        </Link>
        <div className="flex items-center justify-between px-4 py-3 text-sm text-white/40">Paiements</div>
        <div className="flex items-center justify-between px-4 py-3 text-sm text-white/40">Notifications</div>
        <div className="flex items-center justify-between px-4 py-3 text-sm">
          <span>Langue</span>
          <select
            value={i18n.language}
            onChange={(e) => void i18n.changeLanguage(e.target.value)}
            className="rounded-md border border-white/20 bg-transparent px-2 py-1 text-xs uppercase"
          >
            <option value="fr">FR</option>
            <option value="en">EN</option>
          </select>
        </div>
        <div className="flex items-center justify-between px-4 py-3 text-sm text-white/40">Aide</div>
      </div>

      <button
        onClick={() => void signOutUser()}
        className="mt-4 w-full rounded-lg border border-white/10 px-4 py-3 text-left text-sm text-red-400 hover:bg-white/5"
      >
        Déconnexion
      </button>
    </div>
  )
}
