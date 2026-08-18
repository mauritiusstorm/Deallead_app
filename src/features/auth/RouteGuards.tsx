import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from './store'
import { isPlatformAdmin } from '@/lib/permissions'
import { useArtistMembership } from '@/features/artists/hooks/useArtistMembership'
import type { ArtistPermission } from '@/types'
import { artistRoleHasPermission } from '@/lib/permissions'

export function RequireAuth({ children }: { children: ReactNode }) {
  const status = useAuthStore((s) => s.status)
  const location = useLocation()

  if (status === 'loading') return null
  if (status === 'signed-out') return <Navigate to="/sign-in" replace state={{ from: location }} />
  return children
}

export function RequirePlatformAdmin({ children }: { children: ReactNode }) {
  const claims = useAuthStore((s) => s.claims)
  if (!isPlatformAdmin(claims)) return <Navigate to="/" replace />
  return children
}

/**
 * UX-only gate — hides artist-dashboard routes from users without the
 * membership/role. The Firestore Security Rules are the real enforcement.
 */
export function RequireArtistPermission({
  artistId,
  permission,
  children,
}: {
  artistId: string
  permission: ArtistPermission
  children: ReactNode
}) {
  const { membership, loading } = useArtistMembership(artistId)
  if (loading) return null
  if (!membership || !artistRoleHasPermission(membership.role, permission)) {
    return <Navigate to="/" replace />
  }
  return children
}
