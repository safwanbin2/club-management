import { describe, expect, it } from 'vitest'

import { USER_ROLES } from '@common/constants/roles'
import { shouldShowNavbarRoleLabel } from './helpers'

describe('app shell helpers', () => {
  it('shows navbar role labels only for university administrators', () => {
    expect(shouldShowNavbarRoleLabel(USER_ROLES.universityAdmin)).toBe(true)
    expect(shouldShowNavbarRoleLabel(USER_ROLES.clubExecutive)).toBe(false)
    expect(shouldShowNavbarRoleLabel(USER_ROLES.student)).toBe(false)
    expect(shouldShowNavbarRoleLabel(undefined)).toBe(false)
  })
})
