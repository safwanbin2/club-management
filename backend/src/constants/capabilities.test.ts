import { describe, expect, it } from 'vitest'

import { CAPABILITIES, roleHasCapability } from './capabilities.js'
import { USER_ROLES } from './roles.js'

describe('role capabilities', () => {
  it('allows students to browse and join clubs', () => {
    expect(roleHasCapability(USER_ROLES.student, CAPABILITIES.clubsBrowse)).toBe(true)
    expect(roleHasCapability(USER_ROLES.student, CAPABILITIES.clubsJoin)).toBe(true)
  })

  it('allows students to create regular feed posts without granting moderation', () => {
    expect(roleHasCapability(USER_ROLES.student, CAPABILITIES.feedCreate)).toBe(true)
    expect(roleHasCapability(USER_ROLES.student, CAPABILITIES.feedCreateClub)).toBe(false)
    expect(roleHasCapability(USER_ROLES.student, CAPABILITIES.feedModerateClub)).toBe(false)
  })

  it('keeps executive club management scoped away from students', () => {
    expect(roleHasCapability(USER_ROLES.student, CAPABILITIES.clubsManageOwn)).toBe(false)
    expect(roleHasCapability(USER_ROLES.clubExecutive, CAPABILITIES.clubsManageOwn)).toBe(true)
  })

  it('keeps university administration capabilities platform-wide', () => {
    expect(roleHasCapability(USER_ROLES.universityAdmin, CAPABILITIES.usersManage)).toBe(true)
    expect(roleHasCapability(USER_ROLES.clubExecutive, CAPABILITIES.usersManage)).toBe(false)
  })

  it('does not expose attendance permissions after attendance is removed', () => {
    expect(
      Object.values(CAPABILITIES).filter(capability => capability.startsWith('attendance:'))
    ).toEqual([])
  })
})
