import { describe, expect, it } from 'vitest'

import { getDefaultApiUrl, normalizeApiUrl } from './env'

describe('getDefaultApiUrl', () => {
  it('uses the local backend during development', () => {
    expect(getDefaultApiUrl(false)).toBe('http://localhost:5000/api')
  })

  it('uses the same-origin API path in production', () => {
    expect(getDefaultApiUrl(true)).toBe('/api')
  })
})

describe('normalizeApiUrl', () => {
  it('uses the local API path when no value is configured', () => {
    expect(normalizeApiUrl(undefined, 'http://localhost:5000/api')).toBe(
      'http://localhost:5000/api'
    )
  })

  it('trims a trailing slash from an explicit API URL', () => {
    expect(normalizeApiUrl('https://club-management-backend-psi.vercel.app/api/')).toBe(
      'https://club-management-backend-psi.vercel.app/api'
    )
  })

  it('adds the API path when deployment config provides only the backend origin', () => {
    expect(normalizeApiUrl('https://club-management-backend-psi.vercel.app/')).toBe(
      'https://club-management-backend-psi.vercel.app/api'
    )
  })
})
