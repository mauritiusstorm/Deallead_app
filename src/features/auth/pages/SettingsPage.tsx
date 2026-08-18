import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui'
import { useAuthStore } from '../store'

const SECTIONS = [
  'Compte',
  'Abonnement',
  'Paiements',
  'Notifications',
  'Langue',
  'Aide',
]

export default function SettingsPage() {
  const { i18n } = useTranslation()
  const profile = useAuthStore((s) => s.profile)

  return (
    <div className="px-4 pt-6">
      <h1 className="font-display text-2xl tracking-wide">Paramètres</h1>
      <div className="mt-4 flex flex-col gap-2">
        {SECTIONS.map((section) => (
          <Card key={section} className="flex items-center justify-between">
            <span className="text-sm">{section}</span>
            {section === 'Langue' && (
              <select
                value={i18n.language}
                onChange={(e) => void i18n.changeLanguage(e.target.value)}
                className="rounded-md border border-white/20 bg-transparent px-2 py-1 text-sm"
              >
                <option value="fr">FR</option>
                <option value="en">EN</option>
              </select>
            )}
            {section === 'Compte' && <span className="text-xs text-white/40">{profile?.email}</span>}
          </Card>
        ))}
      </div>
    </div>
  )
}
