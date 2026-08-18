import { useNavigate } from 'react-router-dom'
import { usePlayerStore } from '../store'
import { HeartIcon, PlusCircleIcon, CommentIcon, ShuffleIcon, RepeatIcon } from '@/components/icons'
import { BackIcon, MoreIcon } from '@/components/icons'
import { EmptyState } from '@/components/ui'
import { useFavorite } from '@/features/library/useFavorite'

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
  const shuffle = usePlayerStore((s) => s.shuffle)
  const repeatMode = usePlayerStore((s) => s.repeatMode)
  const togglePlay = usePlayerStore((s) => s.togglePlay)
  const next = usePlayerStore((s) => s.next)
  const previous = usePlayerStore((s) => s.previous)
  const seek = usePlayerStore((s) => s.seek)
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle)
  const setRepeatMode = usePlayerStore((s) => s.setRepeatMode)

  const track = queue[currentIndex]
  const { isFavorite, toggle: toggleFavorite } = useFavorite(track?.id, track?.artistId)

  if (!track) {
    return <EmptyState title="Rien en cours de lecture" action={<button onClick={() => navigate(-1)}>Retour</button>} />
  }

  return (
    <div className="flex min-h-dvh flex-col px-6 pb-10 pt-4">
      <header className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} aria-label="Retour" className="p-1 text-black/70">
          <BackIcon className="size-5" />
        </button>
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-black/50">Lecteur</span>
        <button aria-label="Options" className="p-1 text-black/70">
          <MoreIcon className="size-5" />
        </button>
      </header>

      <div className="mt-8 flex flex-1 flex-col items-center justify-center gap-8">
        <div className="aspect-square w-full max-w-xs overflow-hidden rounded-lg bg-black/10">
          {track.artworkUrl && <img src={track.artworkUrl} alt="" className="size-full object-cover" />}
        </div>
        <div className="w-full max-w-xs text-center">
          <h1 className="font-display text-2xl tracking-wide">{track.title}</h1>
          <p className="text-sm text-black/50">{track.artistName}</p>
        </div>

        <div className="w-full max-w-xs">
          <input
            type="range"
            min={0}
            max={duration || track.durationSeconds}
            value={currentTime}
            onChange={(e) => seek(Number(e.target.value))}
            className="w-full accent-black"
          />
          <div className="mt-1 flex justify-between text-xs text-black/40">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration || track.durationSeconds)}</span>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <button
            aria-label="Aléatoire"
            aria-pressed={shuffle}
            onClick={toggleShuffle}
            className={shuffle ? 'text-noir' : 'text-black/40'}
          >
            <ShuffleIcon className="size-5" />
          </button>
          <button aria-label="Précédent" onClick={previous}>
            <BackIcon className="size-6" />
          </button>
          <button
            aria-label={isPlaying ? 'Pause' : 'Écouter'}
            onClick={togglePlay}
            className="flex size-16 items-center justify-center rounded-full bg-noir text-blanc"
          >
            {isPlaying ? (
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-7">
                <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-7">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          <button aria-label="Suivant" onClick={next}>
            <BackIcon className="size-6 rotate-180" />
          </button>
          <button
            aria-label="Répéter"
            aria-pressed={repeatMode !== 'off'}
            onClick={() => setRepeatMode(repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off')}
            className={repeatMode !== 'off' ? 'text-noir' : 'text-black/40'}
          >
            <RepeatIcon className="size-5" />
          </button>
        </div>

        <div className="flex items-center gap-8 text-black/50">
          <button
            aria-label="Favori"
            aria-pressed={isFavorite}
            onClick={() => void toggleFavorite()}
            className={isFavorite ? 'text-red-500' : ''}
          >
            <HeartIcon className="size-5" filled={isFavorite} />
          </button>
          <CommentIcon className="size-5" />
          <PlusCircleIcon className="size-5" />
        </div>
      </div>
    </div>
  )
}
