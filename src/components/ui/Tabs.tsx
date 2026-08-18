import { cn } from '@/lib/cn'

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}) {
  return (
    <div role="tablist" className="flex gap-1 border-b border-white/10">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          role="tab"
          aria-selected={value === tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            'border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
            value === tab.value ? 'border-blanc text-blanc' : 'border-transparent text-white/50 hover:text-white/80',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
