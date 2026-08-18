export function PagePlaceholder({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 px-6 text-center">
      <h1 className="font-display text-2xl tracking-wide">{title}</h1>
      <p className="max-w-xs text-sm text-black/50">{description ?? 'Cet écran arrive prochainement.'}</p>
    </div>
  )
}
