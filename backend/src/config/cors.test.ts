import { describe, expect, it } from 'vitest'

import { getCorsOrigins, normalizeCorsOrigin } from './cors.js'

describe('cors config', () => {
  it('normalizes configured origins with trailing slashes', () => {
    expect(normalizeCorsOrigin('https://club-management-frontend-alpha.vercel.app/')).toBe(
      'https://club-management-frontend-alpha.vercel.app'
    )
  })

  it('includes the deployed frontend aliases in production when env origins are missing', () => {
    expect(
      getCorsOrigins({ frontendOrigin: '', frontendOrigins: '', nodeEnv: 'production' })
    ).toEqual(
      expect.arrayContaining([
        'https://club-management-frontend-alpha.vercel.app',
        'https://club-management-frontend.vercel.app'
      ])
    )
  })

  it('does not wildcard Vercel origins in production', () => {
    expect(
      getCorsOrigins({ frontendOrigin: '', frontendOrigins: '', nodeEnv: 'production' })
    ).not.toContain('https://attacker-preview.vercel.app')
  })
})
