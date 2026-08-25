import { describe, expect, it } from 'vitest'

import { updateOwnProfileSchema } from './user.validation.js'

describe('user.validation updateOwnProfileSchema', () => {
  it('accepts departments from the EDU program list', () => {
    const result = updateOwnProfileSchema.safeParse({
      department: 'MBA',
      name: 'Aisha Rahman',
      studentId: '2026-1234'
    })

    expect(result.success).toBe(true)
  })

  it('rejects profile departments outside the EDU program list', () => {
    const result = updateOwnProfileSchema.safeParse({
      department: 'Computer Science',
      name: 'Aisha Rahman'
    })

    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.error.format().department?._errors).toContain('Select a valid EDU program.')
    }
  })
})
