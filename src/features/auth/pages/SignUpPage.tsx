import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Input } from '@/components/ui'
import { signUpWithEmail } from '../api'
import { mapAuthError } from '../errors'

export default function SignUpPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await signUpWithEmail(email, password, displayName)
      navigate('/onboarding')
    } catch (err) {
      setError(mapAuthError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 px-6">
      <h1 className="font-display text-3xl tracking-wide">{t('auth.signUp')}</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Nom" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
        <Input
          type="email"
          label={t('auth.email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <Input
          type="password"
          label={t('auth.password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          autoComplete="new-password"
          error={error ?? undefined}
        />
        <Button type="submit" loading={loading}>
          {t('auth.signUp')}
        </Button>
      </form>
      <p className="text-center text-sm text-white/50">
        <Link to="/sign-in" className="underline">
          {t('auth.signIn')}
        </Link>
      </p>
    </div>
  )
}
