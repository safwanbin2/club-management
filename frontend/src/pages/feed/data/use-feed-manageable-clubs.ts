import { useQuery } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import type { FeedClub } from '../shared/types'

export default function useFeedManageableClubs(enabled: boolean) {
  const query = useQuery({
    enabled,
    queryFn: ({ signal }) =>
      request<ApiResponse<FeedClub[]>>('feed/manageable-clubs', undefined, 'GET', { signal }),
    queryKey: ['feed', 'manageable-clubs'],
    retry: false,
    select: response => response.data
  })

  return {
    isManageableClubsPending: query.isPending,
    manageableClubs: query.data ?? []
  }
}
