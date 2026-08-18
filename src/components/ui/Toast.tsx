import { cn } from '@/lib/cn'
import { useToastStore, type ToastItem } from './toastStore'

const variantClasses: Record<ToastItem['variant'], string> = {
  default: 'border-white/20 bg-black/90',
  success: 'border-emerald-500/40 bg-black/90',
  error: 'border-red-500/40 bg-black/90',
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex flex-col items-center gap-2 px-4 sm:bottom-6">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          onClick={() => dismiss(t.id)}
          className={cn(
            'pointer-events-auto w-full max-w-sm rounded-md border px-4 py-3 text-sm shadow-lg',
            variantClasses[t.variant],
          )}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}
