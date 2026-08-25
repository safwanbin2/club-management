import { useQuery } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import type { FeedClub } from '../shared/types'

export default function useFeedPostableClubs(enabled: boolean) {
  const query = useQuery({
    enabled,
    queryFn: ({ signal }) =>
      request<ApiResponse<FeedClub[]>>('feed/postable-clubs', undefined, 'GET', { signal }),
    queryKey: ['feed', 'postable-clubs'],
    retry: false,
    select: response => response.data
  })

  return {
    isPostableClubsPending: query.isPending,
    postableClubs: query.data ?? []
  }
}
