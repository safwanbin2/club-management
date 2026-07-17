import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import { buildSearchParams } from '../shared/helpers'
import type { ResourceRequestListPayload, ResourceRequestListResponse } from '../shared/types'

export default function useResourceRequests(payload: ResourceRequestListPayload) {
  const query = useQuery({
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) =>
      request<ApiResponse<ResourceRequestListResponse>>(
        `resource-requests?${buildSearchParams(payload)}`,
        undefined,
        'GET',
        { signal }
      ),
    queryKey: ['resource-requests', 'list', payload],
    retry: false,
    select: response => response.data
  })

  return {
    currentResourceRequestPage: query.data?.currentPage ?? payload.page,
    isResourceRequestsError: query.isError,
    isResourceRequestsFetching: query.isFetching,
    isResourceRequestsPending: query.isPending,
    lastResourceRequestPage: query.data?.lastPage ?? 1,
    refetchResourceRequests: query.refetch,
    resourceRequests: query.data?.data ?? [],
    totalResourceRequests: query.data?.total ?? 0
  }
}
