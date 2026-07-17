import { useQuery } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import { buildSearchParams } from '../shared/helpers'
import type { SearchPayload, SearchResult } from '../shared/types'

export default function useSearchResults(payload: SearchPayload) {
  const query = useQuery({
    enabled: payload.q.trim().length >= 2,
    queryFn: ({ signal }) =>
      request<ApiResponse<SearchResult>>(`search?${buildSearchParams(payload)}`, undefined, 'GET', {
        signal
      }),
    queryKey: ['search', payload],
    retry: false,
    select: response => response.data
  })

  return {
    isSearchError: query.isError,
    isSearchPending: query.isPending && payload.q.trim().length >= 2,
    refetchSearch: query.refetch,
    searchResult: query.data
  }
}
