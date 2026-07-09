import { useQuery } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import type { DashboardSummary } from '../shared/types'

export default function useDashboardSummary() {
  const query = useQuery({
    queryFn: ({ signal }) =>
      request<ApiResponse<DashboardSummary>>('dashboard/summary', undefined, 'GET', { signal }),
    queryKey: ['dashboard', 'summary'],
    retry: false,
    select: response => response.data
  })

  return {
    dashboardSummary: query.data,
    isDashboardError: query.isError,
    isDashboardPending: query.isPending,
    refetchDashboardSummary: query.refetch
  }
}
