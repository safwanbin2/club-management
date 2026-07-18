import { describe, expect, it } from 'vitest'

import { normalizeCorsOrigin } from './cors.js'

describe('cors config', () => {
  it('normalizes configured origins with trailing slashes', () => {
    expect(normalizeCorsOrigin('https://club-management-frontend-alpha.vercel.app/')).toBe(
      'https://club-management-frontend-alpha.vercel.app'
    )
  })
})
