import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { THE_ARTIST_SLUG } from '@/config/artist'
import { useArtistBySlug } from '@/features/artists/hooks/useArtistBySlug'
import { useArtistTracks } from '@/features/music/hooks/useArtistTracks'
import { useArtistProducts } from '@/features/merch/hooks/useArtistProducts'
import { playTrackList } from '@/features/music/playTracks'
import { Input, EmptyState } from '@/components/ui'
import { PageHeader } from '@/components/PageHeader'
import { SearchIcon } from '@/components/icons'

/**
 * Single-artist app: the whole catalog is small enough to search
 * client-side over what's already fetched — no need for Algolia/etc
 * until the catalog grows well past what fits in memory.
 */
export default function SearchPage() {
  const [term, setTerm] = useState('')
  const { artist } = useArtistBySlug(THE_ARTIST_SLUG)
  const { tracks } = useArtistTracks(artist?.id)
  const { products } = useArtistProducts(artist?.id)

  const normalized = term.trim().toLowerCase()
  const matchedTracks = useMemo(
    () => (normalized.length < 2 ? [] : tracks.filter((t) => t.title.toLowerCase().includes(normalized))),
    [tracks, normalized],
  )
  const matchedProducts = useMemo(
    () => (normalized.length < 2 ? [] : products.filter((p) => p.title.toLowerCase().includes(normalized))),
    [products, normalized],
  )
  const hasResults = matchedTracks.length > 0 || matchedProducts.length > 0

  return (
    <div className="px-4 pb-6 pt-4">
      <PageHeader title="Recherche" />

      <div className="relative mt-4">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-black/40" />
        <Input
          className="pl-9"
          placeholder="Un morceau, un produit…"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        />
      </div>

      {normalized.length >= 2 && !hasResults && (
        <EmptyState title="Aucun résultat" description={`Rien ne correspond à « ${term} ».`} />
      )}

      {matchedTracks.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-black/50">Morceaux</h2>
          <div className="flex flex-col gap-1">
            {matchedTracks.map((track, i) => (
              <button
                key={track.id}
                onClick={() => void playTrackList(matchedTracks, artist?.name ?? '', i)}
                className="flex items-center gap-3 rounded-md p-2 text-left hover:bg-black/5"
              >
                <div className="size-10 shrink-0 overflow-hidden rounded bg-black/10">
                  {track.artworkUrl && <img src={track.artworkUrl} alt="" className="size-full object-cover" />}
                </div>
                <span className="truncate text-sm">{track.title}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {matchedProducts.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-black/50">Boutique</h2>
          <div className="flex flex-col gap-1">
            {matchedProducts.map((product) => (
              <Link
                key={product.id}
                to={`/shop/${product.id}`}
                className="flex items-center gap-3 rounded-md p-2 hover:bg-black/5"
              >
                <div className="size-10 shrink-0 overflow-hidden rounded bg-black/10">
                  {product.images[0] && <img src={product.images[0]} alt="" className="size-full object-cover" />}
                </div>
                <span className="truncate text-sm">{product.title}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
