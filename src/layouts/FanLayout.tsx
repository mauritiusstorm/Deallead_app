import { NavLink, Outlet } from 'react-router-dom'
import { PlayerBar } from '@/features/player/PlayerBar'
import { Toaster } from '@/components/ui/Toast'
import { cn } from '@/lib/cn'
import { HomeIcon, SearchIcon, CrownIcon, BagIcon, PersonIcon } from '@/components/icons'

const NAV_ITEMS = [
  { to: '/home', Icon: HomeIcon, label: 'Accueil' },
  { to: '/search', Icon: SearchIcon, label: 'Recherche' },
  { to: '/fan-club', Icon: CrownIcon, label: 'Fan Club' },
  { to: '/shop', Icon: BagIcon, label: 'Boutique' },
  { to: '/account', Icon: PersonIcon, label: 'Profil' },
] as const

export function FanLayout() {
  return (
    <div className="min-h-dvh pb-28 sm:pb-24">
      <main className="safe-top">
        <Outlet />
      </main>
      <PlayerBar />
      <Toaster />
      <nav className="fixed inset-x-0 bottom-0 z-50 flex justify-around border-t border-black/10 bg-white/95 py-3 safe-bottom backdrop-blur">
        {NAV_ITEMS.map(({ to, Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end
            aria-label={label}
            className={({ isActive }) =>
              cn('flex items-center justify-center px-4 py-1', isActive ? 'text-noir' : 'text-black/40')
            }
          >
            <Icon className="size-6" strokeWidth={2} />
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
