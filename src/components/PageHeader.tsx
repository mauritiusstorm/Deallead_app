import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { BackIcon, BellIcon, MenuIcon } from './icons'

/** Top bar matching the app's header pattern: leading icon + centered title + trailing bell. */
export function PageHeader({
  title,
  back = false,
  dark = false,
}: {
  title: string
  back?: boolean
  dark?: boolean
}) {
  const iconColor = dark ? 'text-white/80 hover:text-white' : 'text-black/70 hover:text-noir'
  return (
    <header className="flex items-center justify-between px-4 pt-4">
      {back ? (
        <Link to=".." aria-label="Retour" className={cn('p-1', iconColor)}>
          <BackIcon className="size-5" />
        </Link>
      ) : (
        <MenuIcon className={cn('size-5', dark ? 'text-white/80' : 'text-black/70')} />
      )}
      <h1 className={cn('font-display text-lg tracking-widest uppercase', dark && 'text-white')}>{title}</h1>
      <Link to="/notifications" aria-label="Notifications" className={cn('p-1', iconColor)}>
        <BellIcon className="size-5" />
      </Link>
    </header>
  )
}
