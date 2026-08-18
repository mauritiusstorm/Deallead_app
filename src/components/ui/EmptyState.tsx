import type { ReactNode } from 'react'

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <p className="font-display text-2xl tracking-wide">{title}</p>
      {description && <p className="max-w-xs text-sm text-black/50">{description}</p>}
      {action}
    </div>
  )
}
