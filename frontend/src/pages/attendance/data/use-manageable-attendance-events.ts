import { useQuery } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import type { AttendanceEvent } from '../shared/types'

export default function useManageableAttendanceEvents(enabled: boolean) {
  const query = useQuery({
    enabled,
    queryFn: ({ signal }) =>
      request<ApiResponse<AttendanceEvent[]>>('attendance/manageable-events', undefined, 'GET', {
        signal
      }),
    queryKey: ['attendance', 'manageable-events'],
    retry: false,
    select: response => response.data
  })

  return {
    isManageableAttendanceEventsPending: query.isPending,
    manageableAttendanceEvents: query.data ?? []
  }
}
