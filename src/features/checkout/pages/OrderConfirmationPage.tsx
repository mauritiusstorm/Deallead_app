import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui'
import { useCartStore } from '@/stores/cart'

export default function OrderConfirmationPage() {
  const clear = useCartStore((s) => s.clear)

  useEffect(() => {
    clear()
  }, [clear])

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-display text-3xl tracking-wide">Merci !</h1>
      <p className="max-w-xs text-sm text-white/60">
        Ta commande a bien été reçue. Tu recevras un e-mail de confirmation sous peu.
      </p>
      <Link to="/home">
        <Button variant="secondary">Retour à l'accueil</Button>
      </Link>
    </div>
  )
}
