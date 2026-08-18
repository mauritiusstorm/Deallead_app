import { NavLink, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PlayerBar } from '@/features/player/PlayerBar'
import { Toaster } from '@/components/ui/Toast'
import { cn } from '@/lib/cn'

const NAV_ITEMS = [
  { to: '/home', labelKey: 'nav.home' },
  { to: '/music', labelKey: 'nav.music' },
  { to: '/shop', labelKey: 'nav.shop' },
  { to: '/account', labelKey: 'nav.account' },
] as const

export function FanLayout() {
  const { t } = useTranslation()

  return (
    <div className="min-h-dvh pb-28 sm:pb-24">
      <main className="safe-top">
        <Outlet />
      </main>
      <PlayerBar />
      <Toaster />
      <nav className="fixed inset-x-0 bottom-0 z-50 flex justify-around border-t border-white/10 bg-black/95 py-2 safe-bottom backdrop-blur">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              cn('flex flex-col items-center gap-1 px-4 py-1 text-xs', isActive ? 'text-blanc' : 'text-white/40')
            }
          >
            {t(item.labelKey)}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
