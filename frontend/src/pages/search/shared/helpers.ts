import type { SearchFilterType, SearchPayload, SearchResultType } from './types'

const searchTypes: SearchFilterType[] = ['all', 'clubs', 'events', 'posts', 'profiles']

export function parseSearchType(value: null | string): SearchFilterType {
  return searchTypes.includes(value as SearchFilterType) ? (value as SearchFilterType) : 'all'
}

export function buildSearchParams(payload: SearchPayload) {
  const params = new URLSearchParams()

  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value))
    }
  })

  return params.toString()
}

export function getTypeLabel(type: SearchResultType) {
  if (type === 'clubs') {
    return 'Clubs'
  }

  if (type === 'events') {
    return 'Events'
  }

  if (type === 'posts') {
    return 'Feed'
  }

  return 'Profiles'
}
