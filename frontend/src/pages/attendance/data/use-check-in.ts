import { useMutation, useQueryClient } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import type { AttendanceRecord } from '../shared/types'

export default function useCheckIn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (token: string) =>
      request<ApiResponse<AttendanceRecord>>('attendance/check-in', { token }, 'POST'),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['attendance'] })
    }
  })
}
