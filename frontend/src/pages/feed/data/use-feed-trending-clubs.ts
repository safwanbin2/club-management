import { useQuery } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import type { FeedTrendingClub } from '../shared/types'

export default function useFeedTrendingClubs() {
  const query = useQuery({
    queryFn: ({ signal }) =>
      request<ApiResponse<FeedTrendingClub[]>>('feed/trending-clubs', undefined, 'GET', {
        signal
      }),
    queryKey: ['feed', 'trending-clubs'],
    retry: false,
    select: response => response.data
  })

  return {
    isTrendingClubsPending: query.isPending,
    trendingClubs: query.data ?? []
  }
}
