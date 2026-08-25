import { describe, expect, it } from 'vitest'

import { shouldShowEventRegistrationAction } from './helpers'

describe('event helpers', () => {
  it('hides registration actions for manageable events', () => {
    expect(shouldShowEventRegistrationAction({ canManage: true })).toBe(false)
    expect(shouldShowEventRegistrationAction({ canManage: false })).toBe(true)
  })
})
