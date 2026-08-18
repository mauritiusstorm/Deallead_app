import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { Toaster } from '@/components/ui/Toast'

const NAV_ITEMS = [
  { to: '', label: 'Overview' },
  { to: 'artists', label: 'Artistes' },
  { to: 'users', label: 'Utilisateurs' },
  { to: 'content', label: 'Contenu' },
  { to: 'transactions', label: 'Transactions' },
  { to: 'payouts', label: 'Payouts' },
  { to: 'ads', label: 'Publicités' },
  { to: 'orders', label: 'Commandes' },
  { to: 'subscriptions', label: 'Abonnements' },
  { to: 'moderation', label: 'Modération' },
  { to: 'settings', label: 'Paramètres' },
] as const

export function AdminLayout() {
  return (
    <div className="flex min-h-dvh flex-col sm:flex-row">
      <aside className="shrink-0 border-white/10 sm:w-56 sm:border-r">
        <div className="flex gap-1 overflow-x-auto p-3 sm:flex-col sm:overflow-visible">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={`/admin/${item.to}`}
              end={item.to === ''}
              className={({ isActive }) =>
                cn(
                  'shrink-0 whitespace-nowrap rounded-md px-3 py-2 text-sm',
                  isActive ? 'bg-white text-noir' : 'text-white/60 hover:bg-white/10',
                )
              }
            >
              {item.label}
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
