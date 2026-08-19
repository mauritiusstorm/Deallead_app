import { Button } from './Button'
import { cn } from '@/lib/cn'

export function ErrorState({
  message = "Une erreur est survenue.",
  onRetry,
  dark = false,
}: {
  message?: string
  onRetry?: () => void
  dark?: boolean
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <p className={cn('text-sm', dark ? 'text-white/70' : 'text-black/70')}>{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Réessayer
        </Button>
      )}
    </div>
  )
}
