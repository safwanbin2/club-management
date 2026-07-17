import { useQuery } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import type { EventClub } from '@pages/events/shared/types'

export default function useManageablePollClubs(enabled: boolean) {
  const query = useQuery({
    enabled,
    queryFn: ({ signal }) =>
      request<ApiResponse<EventClub[]>>('polls/manageable-clubs', undefined, 'GET', { signal }),
    queryKey: ['polls', 'manageable-clubs'],
    retry: false,
    select: response => response.data
  })

  return {
    isManageablePollClubsPending: query.isPending,
    manageablePollClubs: query.data ?? []
  }
}
