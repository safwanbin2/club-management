import { describe, expect, it } from 'vitest'

import { normalizeSearchQuery } from './search.service.js'

describe('search.service query normalization', () => {
  it('trims and collapses whitespace', () => {
    expect(normalizeSearchQuery('  robotics   workshop  ')).toBe('robotics workshop')
  })
})
