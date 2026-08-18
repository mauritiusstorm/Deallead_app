import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button, Input } from '@/components/ui'
import { resetPassword } from '../api'
import { mapAuthError } from '../errors'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await resetPassword(email)
      setSent(true)
    } catch (err) {
      setError(mapAuthError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 px-6">
      <h1 className="font-display text-3xl tracking-wide">Mot de passe oublié</h1>
      {sent ? (
        <p className="text-sm text-black/70">
          Si un compte existe pour cet e-mail, un lien de réinitialisation vient d'être envoyé.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            type="email"
            label="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            error={error ?? undefined}
          />
          <Button type="submit" loading={loading}>
            Envoyer le lien
          </Button>
        </form>
      )}
      <p className="text-center text-sm text-black/50">
        <Link to="/sign-in" className="underline">
          Retour à la connexion
        </Link>
      </p>
    </div>
  )
}
