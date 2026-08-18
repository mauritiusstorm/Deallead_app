import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { FanLayout } from '@/layouts/FanLayout'
import { ArtistDashboardLayout } from '@/layouts/ArtistDashboardLayout'
import { AdminLayout } from '@/layouts/AdminLayout'
import { RequireAuth, RequirePlatformAdmin } from '@/features/auth/RouteGuards'
import { PagePlaceholder } from '@/components/PagePlaceholder'
import { useAuthStore } from '@/features/auth/store'

const LandingPage = lazy(() => import('@/features/artists/pages/LandingPage'))
const SignInPage = lazy(() => import('@/features/auth/pages/SignInPage'))
const SignUpPage = lazy(() => import('@/features/auth/pages/SignUpPage'))
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage'))
const OnboardingPage = lazy(() => import('@/features/auth/pages/OnboardingPage'))
const HomePage = lazy(() => import('@/features/music/pages/HomePage'))
const MusicPage = lazy(() => import('@/features/music/pages/MusicPage'))
const ShopPage = lazy(() => import('@/features/merch/pages/ShopPage'))
const ProductPage = lazy(() => import('@/features/merch/pages/ProductPage'))
const CartPage = lazy(() => import('@/features/checkout/pages/CartPage'))
const OrderConfirmationPage = lazy(() => import('@/features/checkout/pages/OrderConfirmationPage'))
const NowPlayingPage = lazy(() => import('@/features/player/pages/NowPlayingPage'))
const AccountPage = lazy(() => import('@/features/auth/pages/AccountPage'))
const SettingsPage = lazy(() => import('@/features/auth/pages/SettingsPage'))

/** Screens deferred beyond this pass (events/ticketing, subscriptions, exclusive content) — routed and typed, content later. */
const FAN_PLACEHOLDERS: { path: string; title: string }[] = [
  { path: '/albums/:albumId', title: 'Album' },
  { path: '/queue', title: 'File d’attente' },
  { path: '/library', title: 'Bibliothèque' },
  { path: '/library/favorites', title: 'Favoris' },
  { path: '/library/history', title: 'Historique' },
  { path: '/account/orders', title: 'Commandes' },
  { path: '/account/tickets', title: 'Billets' },
  { path: '/events', title: 'Événements' },
  { path: '/events/:eventId', title: 'Événement' },
  { path: '/subscribe', title: 'Abonnement' },
  { path: '/exclusive/:contentId', title: 'Contenu exclusif' },
  { path: '/notifications', title: 'Notifications' },
]

const ARTIST_DASHBOARD_PLACEHOLDERS: { path: string; title: string }[] = [
  { path: '', title: 'Aperçu' },
  { path: 'analytics', title: 'Analytics' },
  { path: 'music', title: 'Musique' },
  { path: 'music/tracks/new', title: 'Nouveau morceau' },
  { path: 'music/tracks/:trackId', title: 'Éditer le morceau' },
  { path: 'music/albums/new', title: 'Nouvel album' },
  { path: 'music/albums/:albumId', title: 'Éditer l’album' },
  { path: 'music/upload', title: 'Upload' },
  { path: 'content', title: 'Contenu' },
  { path: 'content/new', title: 'Nouveau contenu' },
  { path: 'merch', title: 'Boutique' },
  { path: 'merch/products/:productId', title: 'Éditeur produit' },
  { path: 'merch/orders', title: 'Commandes' },
  { path: 'events', title: 'Événements' },
  { path: 'revenue', title: 'Revenus' },
  { path: 'revenue/transactions', title: 'Transactions' },
  { path: 'revenue/payouts', title: 'Payouts' },
  { path: 'settings', title: 'Paramètres du profil' },
  { path: 'settings/monetization', title: 'Monétisation' },
  { path: 'settings/stripe-connect', title: 'Compte / Stripe Connect' },
]

const ADMIN_PLACEHOLDERS: { path: string; title: string }[] = [
  { path: '', title: 'Overview' },
  { path: 'users', title: 'Utilisateurs' },
  { path: 'users/:userId', title: 'Détail utilisateur' },
  { path: 'content', title: 'Contenu' },
  { path: 'transactions', title: 'Transactions' },
  { path: 'payouts', title: 'Payouts' },
  { path: 'orders', title: 'Commandes' },
  { path: 'subscriptions', title: 'Abonnements' },
  { path: 'settings', title: 'Paramètres plateforme' },
]

function IndexRoute() {
  const status = useAuthStore((s) => s.status)
  if (status === 'loading') return null
  return status === 'signed-in' ? <Navigate to="/home" replace /> : <LandingPage />
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<IndexRoute />} />
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/sign-up" element={<SignUpPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route
        path="/onboarding"
        element={
          <RequireAuth>
            <OnboardingPage />
          </RequireAuth>
        }
      />
      <Route path="/player" element={<NowPlayingPage />} />

      <Route
        element={
          <RequireAuth>
            <FanLayout />
          </RequireAuth>
        }
      >
        <Route path="/home" element={<HomePage />} />
        <Route path="/music" element={<MusicPage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/shop/:productId" element={<ProductPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout/confirmation/:orderId" element={<OrderConfirmationPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        {FAN_PLACEHOLDERS.map((p) => (
          <Route key={p.path} path={p.path} element={<PagePlaceholder title={p.title} />} />
        ))}
      </Route>

      {/* Artist-management screens: today this is just you, so /artist/:artistId
          is reached from Account rather than a multi-artist switcher. */}
      <Route
        path="/artist/:artistId"
        element={
          <RequireAuth>
            <ArtistDashboardLayout />
          </RequireAuth>
        }
      >
        {ARTIST_DASHBOARD_PLACEHOLDERS.map((p) => (
          <Route key={p.path} path={p.path} element={<PagePlaceholder title={p.title} />} />
        ))}
      </Route>

      <Route
        path="/admin"
        element={
          <RequireAuth>
            <RequirePlatformAdmin>
              <AdminLayout />
            </RequirePlatformAdmin>
          </RequireAuth>
        }
      >
        {ADMIN_PLACEHOLDERS.map((p) => (
          <Route key={p.path} path={p.path} element={<PagePlaceholder title={p.title} />} />
        ))}
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
