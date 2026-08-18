import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Input } from '@/components/ui'
import { toast } from '@/components/ui/toastStore'
import { signInWithEmail, signInWithGoogle } from '../api'
import { mapAuthError } from '../errors'

export default function SignInPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await signInWithEmail(email, password)
      navigate('/')
    } catch (err) {
      setError(mapAuthError(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setLoading(true)
    try {
      await signInWithGoogle()
      navigate('/')
    } catch (err) {
      toast(mapAuthError(err), 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 px-6">
      <h1 className="font-display text-3xl tracking-wide">{t('auth.signIn')}</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          autoComplete="current-password"
          error={error ?? undefined}
        />
        <Link to="/forgot-password" className="text-sm text-black/50 hover:text-black/80">
          {t('auth.forgotPassword')}
        </Link>
        <Button type="submit" loading={loading}>
          {t('auth.signIn')}
        </Button>
      </form>
      <Button variant="secondary" onClick={handleGoogle} disabled={loading}>
        {t('auth.continueWithGoogle')}
      </Button>
      <p className="text-center text-sm text-black/50">
        <Link to="/sign-up" className="underline">
          {t('auth.signUp')}
        </Link>
      </p>
    </div>
  )
}
