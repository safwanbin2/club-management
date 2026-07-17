import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import { buildSearchParams } from '../shared/helpers'
import type { AttendanceHistoryResponse } from '../shared/types'

export default function useAttendanceHistory() {
  const payload = {
    page: 1,
    perPage: 20
  }

  const query = useQuery({
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) =>
      request<ApiResponse<AttendanceHistoryResponse>>(
        `attendance/history?${buildSearchParams(payload)}`,
        undefined,
        'GET',
        { signal }
      ),
    queryKey: ['attendance', 'history', payload],
    retry: false,
    select: response => response.data
  })

  return {
    attendanceHistory: query.data?.data ?? [],
    isAttendanceHistoryError: query.isError,
    isAttendanceHistoryPending: query.isPending,
    refetchAttendanceHistory: query.refetch,
    totalAttendanceHistory: query.data?.total ?? 0
  }
}
