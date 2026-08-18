import { NavLink, Outlet, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'
import { Toaster } from '@/components/ui/Toast'

const NAV_ITEMS = [
  { to: '', labelKey: 'nav.overview' },
  { to: 'music', labelKey: 'nav.music' },
  { to: 'content', labelKey: 'nav.content' },
  { to: 'merch', labelKey: 'nav.merch' },
  { to: 'events', labelKey: 'nav.events' },
  { to: 'revenue', labelKey: 'nav.revenue' },
  { to: 'settings', labelKey: 'nav.settings' },
] as const

export function ArtistDashboardLayout() {
  const { t } = useTranslation('artist')
  const { artistId } = useParams()

  return (
    <div className="flex min-h-dvh flex-col sm:flex-row">
      <aside className="shrink-0 border-black/10 sm:w-56 sm:border-r">
        <div className="flex gap-1 overflow-x-auto p-3 sm:flex-col sm:overflow-visible">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={`/artist/${artistId}/${item.to}`}
              end={item.to === ''}
              className={({ isActive }) =>
                cn(
                  'shrink-0 whitespace-nowrap rounded-md px-3 py-2 text-sm',
                  isActive ? 'bg-black text-blanc' : 'text-black/60 hover:bg-black/10',
                )
              }
            >
              {t(`nav.${item.to || 'overview'}`)}
            </NavLink>
          ))}
        </div>
      </aside>
      <main className="flex-1 p-4 sm:p-6">
        <Outlet />
      </main>
      <Toaster />
    </div>
  )
}
