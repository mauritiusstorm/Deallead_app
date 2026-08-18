import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui'

export default function LandingPage() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 px-6 text-center">
      <div>
        <h1 className="font-display text-5xl tracking-wide">DEALLEADx</h1>
        <p className="mt-2 text-sm uppercase tracking-[0.3em] text-black/50">{t('app.tagline')}</p>
      </div>
      <p className="max-w-sm text-sm text-black/60">
        La plateforme qui permet aux artistes de posséder leur audience et de monétiser directement leurs fans.
      </p>
      <div className="flex w-full max-w-xs flex-col gap-3">
        <Link to="/sign-up">
          <Button className="w-full">{t('auth.signUp')}</Button>
        </Link>
        <Link to="/sign-in">
          <Button variant="secondary" className="w-full">
            {t('auth.signIn')}
          </Button>
        </Link>
      </div>
    </div>
  )
}
