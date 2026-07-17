export type SearchResultType = 'clubs' | 'events' | 'posts' | 'profiles'
export type SearchFilterType = SearchResultType | 'all'

export type SearchResultItem = {
  description: string
  id: string
  meta: string
  path: string
  title: string
  type: SearchResultType
}

export type SearchResultGroup = {
  items: SearchResultItem[]
  title: string
  total: number
  type: SearchResultType
}

export type SearchResult = {
  groups: SearchResultGroup[]
  query: string
}

export type SearchPayload = {
  limit: number
  q: string
  type: SearchFilterType
}
