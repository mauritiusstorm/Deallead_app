import { describe, expect, it } from 'vitest'
import { artistRoleHasPermission, ARTIST_ROLE_RANK } from './roles'

describe('artistRoleHasPermission', () => {
  it('grants owners every permission', () => {
    expect(artistRoleHasPermission('owner', 'payouts:manage')).toBe(true)
    expect(artistRoleHasPermission('owner', 'team:manage')).toBe(true)
  })

  it('denies viewers every write permission', () => {
    expect(artistRoleHasPermission('viewer', 'music:write')).toBe(false)
    expect(artistRoleHasPermission('viewer', 'payouts:manage')).toBe(false)
  })

  it('grants finance payout management but not music publishing', () => {
    expect(artistRoleHasPermission('finance', 'payouts:manage')).toBe(true)
    expect(artistRoleHasPermission('finance', 'music:publish')).toBe(false)
  })

  it('never lets a lower-ranked role manage the team', () => {
    for (const role of ['viewer', 'editor', 'finance', 'manager'] as const) {
      expect(artistRoleHasPermission(role, 'team:manage')).toBe(false)
    }
  })

  it('ranks owner strictly above every other role', () => {
    for (const [role, rank] of Object.entries(ARTIST_ROLE_RANK)) {
      if (role === 'owner') continue
      expect(ARTIST_ROLE_RANK.owner).toBeGreaterThan(rank)
    }
  })
})
