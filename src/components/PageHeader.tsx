import { Link } from 'react-router-dom'
import { BackIcon, BellIcon, MenuIcon } from './icons'

/** Top bar matching the app's header pattern: leading icon + centered title + trailing bell. */
export function PageHeader({ title, back = false }: { title: string; back?: boolean }) {
  return (
    <header className="flex items-center justify-between px-4 pt-4">
      {back ? (
        <Link to=".." aria-label="Retour" className="p-1 text-white/70 hover:text-blanc">
          <BackIcon className="size-5" />
        </Link>
      ) : (
        <MenuIcon className="size-5 text-white/70" />
      )}
      <h1 className="font-display text-lg tracking-widest uppercase">{title}</h1>
      <Link to="/notifications" aria-label="Notifications" className="p-1 text-white/70 hover:text-blanc">
        <BellIcon className="size-5" />
      </Link>
    </header>
  )
}
