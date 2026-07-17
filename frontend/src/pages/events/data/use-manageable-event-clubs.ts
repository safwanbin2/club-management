import { useQuery } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import type { EventClub } from '../shared/types'

export default function useManageableEventClubs(enabled: boolean) {
  const query = useQuery({
    enabled,
    queryFn: ({ signal }) =>
      request<ApiResponse<EventClub[]>>('events/manageable-clubs', undefined, 'GET', { signal }),
    queryKey: ['events', 'manageable-clubs'],
    retry: false,
    select: response => response.data
  })

  return {
    isManageableEventClubsPending: query.isPending,
    manageableEventClubs: query.data ?? []
  }
}
