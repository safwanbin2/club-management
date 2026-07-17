import { useMutation, useQueryClient } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'

export default function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () =>
      request<ApiResponse<{ markedRead: number }>>('notifications/read-all', undefined, 'PATCH'),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })
}
