import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function EmptyState({
  title,
  description,
  action,
  dark = false,
}: {
  title: string
  description?: string
  action?: ReactNode
  dark?: boolean
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <p className="font-display text-2xl tracking-wide">{title}</p>
      {description && <p className={cn('max-w-xs text-sm', dark ? 'text-white/50' : 'text-black/50')}>{description}</p>}
      {action}
    </div>
  )
}
