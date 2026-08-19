import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui'

export default function LandingPage() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-noir px-6 text-center text-blanc">
      <div className="flex flex-col items-center gap-4">
        <img src="/brand/logo-white.png" alt="Deallead" className="w-64 max-w-full" />
        <p className="text-xs uppercase tracking-[0.3em] text-white/60">{t('app.tagline')}</p>
      </div>
      <p className="max-w-sm text-sm text-white/60">
        La plateforme qui permet aux artistes de posséder leur audience et de monétiser directement leurs fans.
      </p>
      <div className="flex w-full max-w-xs flex-col gap-3">
        <Link to="/sign-up">
          <Button className="w-full bg-blanc text-noir hover:bg-white/90">{t('auth.signUp')}</Button>
        </Link>
        <Link to="/sign-in">
          <Button variant="secondary" className="w-full border-white/25 text-blanc hover:border-white/60">
            {t('auth.signIn')}
          </Button>
        </Link>
      </div>
    </div>
  )
}
