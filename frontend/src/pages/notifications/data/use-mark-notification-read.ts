import { useMutation, useQueryClient } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import type { NotificationItem } from '../shared/types'

export default function useMarkNotificationRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (notificationId: string) =>
      request<ApiResponse<NotificationItem>>(
        `notifications/${notificationId}/read`,
        undefined,
        'PATCH'
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })
}
