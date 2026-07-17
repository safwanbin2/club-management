import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import { buildSearchParams } from '../shared/helpers'
import type { AttendanceReport } from '../shared/types'
import type { EventRegistrationStatus } from '@pages/events/shared/types'

export default function useAttendanceReport(
  eventId: null | string,
  status: EventRegistrationStatus,
  enabled: boolean
) {
  const payload = {
    page: 1,
    perPage: 100,
    status
  }

  const query = useQuery({
    enabled,
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) =>
      request<ApiResponse<AttendanceReport>>(
        `attendance/events/${eventId}/report?${buildSearchParams(payload)}`,
        undefined,
        'GET',
        { signal }
      ),
    queryKey: ['attendance', 'report', eventId, payload],
    retry: false,
    select: response => response.data
  })

  return {
    attendanceReport: query.data ?? null,
    isAttendanceReportError: query.isError,
    isAttendanceReportPending: query.isPending,
    refetchAttendanceReport: query.refetch
  }
}
