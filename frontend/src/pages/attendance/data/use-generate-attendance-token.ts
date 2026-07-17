import { useMutation } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import type { AttendanceToken } from '../shared/types'

export default function useGenerateAttendanceToken() {
  return useMutation({
    mutationFn: (eventId: string) =>
      request<ApiResponse<AttendanceToken>>(`attendance/events/${eventId}/token`, undefined, 'POST')
  })
}
