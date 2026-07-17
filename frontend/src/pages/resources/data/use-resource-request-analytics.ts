import { useQuery } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import type { ResourceRequestAnalytics } from '../shared/types'

export default function useResourceRequestAnalytics() {
  const query = useQuery({
    queryFn: ({ signal }) =>
      request<ApiResponse<ResourceRequestAnalytics>>(
        'resource-requests/analytics',
        undefined,
        'GET',
        { signal }
      ),
    queryKey: ['resource-requests', 'analytics'],
    retry: false,
    select: response => response.data
  })

  return {
    analytics: query.data,
    isResourceAnalyticsPending: query.isPending
  }
}
