export * from '../../types/roles'

/**
 * Client-side permission checks are UX-only (hide/show buttons). The real
 * enforcement always lives in Firestore Security Rules and/or Cloud
 * Functions — never trust this module for authorization decisions.
 */
export { artistRoleHasPermission, ARTIST_ROLE_RANK } from '../../types/roles'

export function isPlatformAdmin(claims: Record<string, unknown> | undefined | null): boolean {
  return claims?.platform_admin === true
}
