import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Input, EmptyState } from '@/components/ui'
import { searchArtists } from '../api'
import type { Artist } from '@/types'
import { Link } from 'react-router-dom'

export default function SearchPage() {
  const { t } = useTranslation()
  const [term, setTerm] = useState('')
  const [results, setResults] = useState<Artist[]>([])
  const [loading, setLoading] = useState(false)

  async function handleChange(value: string) {
    setTerm(value)
    if (value.trim().length < 2) {
      setResults([])
      return
    }
    setLoading(true)
    try {
      setResults(await searchArtists(value.trim()))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 pt-6">
      <h1 className="font-display text-2xl tracking-wide">{t('nav.search')}</h1>
      <Input
        className="mt-4"
        placeholder="Artiste, morceau, album…"
        value={term}
        onChange={(e) => handleChange(e.target.value)}
      />

      {!loading && term.length >= 2 && results.length === 0 && (
        <EmptyState title="Aucun résultat" description={`Rien ne correspond à « ${term} ».`} />
      )}

      <div className="mt-4 flex flex-col gap-2">
        {results.map((artist) => (
          <Link key={artist.id} to={`/artists/${artist.slug}`} className="flex items-center gap-3 rounded-md p-2 hover:bg-white/5">
            <div className="size-10 shrink-0 overflow-hidden rounded-full bg-white/10">
              {artist.avatarUrl && <img src={artist.avatarUrl} alt="" className="size-full object-cover" />}
            </div>
            <span className="text-sm">{artist.name}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
