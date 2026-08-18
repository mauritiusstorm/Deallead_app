import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/cn'

export function Drawer({
  open,
  onClose,
  children,
  side = 'bottom',
}: {
  open: boolean
  onClose: () => void
  children: ReactNode
  side?: 'bottom' | 'right'
}) {
  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/70" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'absolute border-white/10 bg-noir p-5',
          side === 'bottom'
            ? 'inset-x-0 bottom-0 rounded-t-xl border-t safe-bottom'
            : 'inset-y-0 right-0 h-full w-full max-w-sm border-l',
        )}
      >
        {children}
      </div>
    </div>,
    document.body,
  )
}
