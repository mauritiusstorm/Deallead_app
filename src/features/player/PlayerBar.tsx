import { Link } from 'react-router-dom'
import { Pause, Play, SkipBack, SkipForward } from './icons'
import { usePlayerStore } from './store'

export function PlayerBar() {
  const queue = usePlayerStore((s) => s.queue)
  const currentIndex = usePlayerStore((s) => s.currentIndex)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const currentTime = usePlayerStore((s) => s.currentTime)
  const duration = usePlayerStore((s) => s.duration)
  const togglePlay = usePlayerStore((s) => s.togglePlay)
  const next = usePlayerStore((s) => s.next)
  const previous = usePlayerStore((s) => s.previous)

  const track = queue[currentIndex]
  if (!track) return null

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="fixed inset-x-0 bottom-14 z-40 border-t border-white/10 bg-black/95 backdrop-blur sm:bottom-0">
      <div className="h-0.5 bg-white/10">
        <div className="h-full bg-blanc transition-[width]" style={{ width: `${progress}%` }} />
      </div>
      <Link to="/player" className="flex items-center gap-3 px-4 py-2.5">
        <div className="size-10 shrink-0 overflow-hidden rounded bg-white/10">
          {track.artworkUrl && <img src={track.artworkUrl} alt="" className="size-full object-cover" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{track.title}</p>
          <p className="truncate text-xs text-white/50">{track.artistName}</p>
        </div>
      </Link>
      <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1">
        <button
          aria-label="Précédent"
          onClick={(e) => {
            e.stopPropagation()
            previous()
          }}
          className="rounded-full p-2 hover:bg-white/10"
        >
          <SkipBack />
        </button>
        <button
          aria-label={isPlaying ? 'Pause' : 'Écouter'}
          onClick={(e) => {
            e.stopPropagation()
            togglePlay()
          }}
          className="rounded-full bg-blanc p-2 text-noir"
        >
          {isPlaying ? <Pause /> : <Play />}
        </button>
        <button
          aria-label="Suivant"
          onClick={(e) => {
            e.stopPropagation()
            next()
          }}
          className="rounded-full p-2 hover:bg-white/10"
        >
          <SkipForward />
        </button>
      </div>
    </div>
  )
}
