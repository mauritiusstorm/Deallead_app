import { cn } from '@/lib/cn'

export function Skeleton({ className, dark = false }: { className?: string; dark?: boolean }) {
  return <div className={cn('animate-pulse rounded-md', dark ? 'bg-white/10' : 'bg-black/10', className)} />
}
