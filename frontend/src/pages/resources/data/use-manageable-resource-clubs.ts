import { useQuery } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import type { ResourceRequestClub } from '../shared/types'

export default function useManageableResourceClubs(enabled: boolean) {
  const query = useQuery({
    enabled,
    queryFn: ({ signal }) =>
      request<ApiResponse<ResourceRequestClub[]>>(
        'resource-requests/manageable-clubs',
        undefined,
        'GET',
        { signal }
      ),
    queryKey: ['resource-requests', 'manageable-clubs'],
    retry: false,
    select: response => response.data
  })

  return {
    isManageableResourceClubsPending: query.isPending,
    manageableResourceClubs: query.data ?? []
  }
}
