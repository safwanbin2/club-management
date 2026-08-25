import { describe, expect, it } from 'vitest'

import { registerSchema } from './auth.validation.js'

describe('auth.validation registerSchema', () => {
  it('accepts East Delta University registration emails and programs', () => {
    const result = registerSchema.safeParse({
      department: 'B.SC. IN CSE',
      email: 'student@eastdelta.edu.bd',
      name: 'Aisha Rahman',
      password: 'Strong123',
      studentId: '2026-1234'
    })

    expect(result.success).toBe(true)
  })

  it('rejects registration emails outside the East Delta University domain', () => {
    const result = registerSchema.safeParse({
      email: 'student@gmail.com',
      name: 'Aisha Rahman',
      password: 'Strong123'
    })

    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.error.format().email?._errors).toContain(
        'This email domain is not allowed. Use your @eastdelta.edu.bd email.'
      )
    }
  })

  it('rejects registration programs outside the EDU program list', () => {
    const result = registerSchema.safeParse({
      department: 'Computer Science',
      email: 'student@eastdelta.edu.bd',
      name: 'Aisha Rahman',
      password: 'Strong123'
    })

    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.error.format().department?._errors).toContain('Select a valid EDU program.')
    }
  })
})
