import { useNavigate } from 'react-router-dom'
import { usePlayerStore } from '../store'
import { Pause, Play, SkipBack, SkipForward } from '../icons'
import { EmptyState } from '@/components/ui'

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function NowPlayingPage() {
  const navigate = useNavigate()
  const queue = usePlayerStore((s) => s.queue)
  const currentIndex = usePlayerStore((s) => s.currentIndex)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const currentTime = usePlayerStore((s) => s.currentTime)
  const duration = usePlayerStore((s) => s.duration)
  const togglePlay = usePlayerStore((s) => s.togglePlay)
  const next = usePlayerStore((s) => s.next)
  const previous = usePlayerStore((s) => s.previous)
  const seek = usePlayerStore((s) => s.seek)

  const track = queue[currentIndex]

  if (!track) {
    return <EmptyState title="Rien en cours de lecture" action={<button onClick={() => navigate(-1)}>Retour</button>} />
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 px-8">
      <div className="aspect-square w-full max-w-xs overflow-hidden rounded-lg bg-white/10">
        {track.artworkUrl && <img src={track.artworkUrl} alt="" className="size-full object-cover" />}
      </div>
      <div className="w-full max-w-xs text-center">
        <h1 className="font-display text-2xl tracking-wide">{track.title}</h1>
        <p className="text-sm text-white/50">{track.artistName}</p>
      </div>

      <div className="w-full max-w-xs">
        <input
          type="range"
          min={0}
          max={duration || track.durationSeconds}
          value={currentTime}
          onChange={(e) => seek(Number(e.target.value))}
          className="w-full accent-white"
        />
        <div className="mt-1 flex justify-between text-xs text-white/40">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration || track.durationSeconds)}</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button aria-label="Précédent" onClick={previous}>
          <SkipBack />
        </button>
        <button aria-label={isPlaying ? 'Pause' : 'Écouter'} onClick={togglePlay} className="rounded-full bg-blanc p-4 text-noir">
          {isPlaying ? <Pause /> : <Play />}
        </button>
        <button aria-label="Suivant" onClick={next}>
          <SkipForward />
        </button>
      </div>
    </div>
  )
}
