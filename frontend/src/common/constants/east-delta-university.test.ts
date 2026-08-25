import { describe, expect, it } from 'vitest'

import {
  EAST_DELTA_PROGRAM_OPTIONS,
  isEastDeltaEmail,
  isEastDeltaProgram
} from './east-delta-university'

describe('East Delta University constants', () => {
  it('exposes a clean selectable program list', () => {
    expect(EAST_DELTA_PROGRAM_OPTIONS).toContainEqual({
      label: 'DATA ANALYTICS AND DESIGN THINKING FOR BUSINESS',
      value: 'DATA ANALYTICS AND DESIGN THINKING FOR BUSINESS'
    })
    expect(EAST_DELTA_PROGRAM_OPTIONS.some(option => option.value.includes('&#xA0;'))).toBe(false)
  })

  it('identifies valid East Delta University emails', () => {
    expect(isEastDeltaEmail('student@eastdelta.edu.bd')).toBe(true)
    expect(isEastDeltaEmail('student@gmail.com')).toBe(false)
  })

  it('identifies listed EDU programs', () => {
    expect(isEastDeltaProgram('B.SC. IN CSE')).toBe(true)
    expect(isEastDeltaProgram('Computer Science')).toBe(false)
  })
})
