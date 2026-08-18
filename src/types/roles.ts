import { z } from 'zod'

/** Global platform-level roles, granted via Firebase custom claims. */
export const platformRoleSchema = z.enum(['platform_admin', 'moderator'])
export type PlatformRole = z.infer<typeof platformRoleSchema>

/**
 * Per-artist roles, granted via an `artistMembers` Firestore document.
 * Never inferred client-side — always checked against the membership doc
 * (and mirrored by Firestore Security Rules / Cloud Functions).
 */
export const artistRoleSchema = z.enum(['owner', 'admin', 'manager', 'editor', 'finance', 'viewer'])
export type ArtistRole = z.infer<typeof artistRoleSchema>

/** Ordered from least to most privileged for simple `>=` comparisons. */
export const ARTIST_ROLE_RANK: Record<ArtistRole, number> = {
  viewer: 0,
  editor: 1,
  finance: 1,
  manager: 2,
  admin: 3,
  owner: 4,
}

export type ArtistPermission =
  | 'music:write'
  | 'music:publish'
  | 'content:write'
  | 'merch:write'
  | 'events:write'
  | 'team:manage'
  | 'settings:write'
  | 'revenue:read'
  | 'payouts:manage'

const ROLE_PERMISSIONS: Record<ArtistRole, ArtistPermission[]> = {
  owner: [
    'music:write',
    'music:publish',
    'content:write',
    'merch:write',
    'events:write',
    'team:manage',
    'settings:write',
    'revenue:read',
    'payouts:manage',
  ],
  admin: [
    'music:write',
    'music:publish',
    'content:write',
    'merch:write',
    'events:write',
    'team:manage',
    'settings:write',
    'revenue:read',
  ],
  manager: ['music:write', 'music:publish', 'content:write', 'merch:write', 'events:write', 'revenue:read'],
  editor: ['music:write', 'content:write'],
  finance: ['revenue:read', 'payouts:manage'],
  viewer: [],
}

export function artistRoleHasPermission(role: ArtistRole, permission: ArtistPermission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission)
}
