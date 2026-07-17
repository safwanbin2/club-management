import { useQuery } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import type { NotificationUnreadCount } from '@pages/notifications/shared/types'

export default function useNotificationUnreadCount() {
  const query = useQuery({
    queryFn: ({ signal }) =>
      request<ApiResponse<NotificationUnreadCount>>(
        'notifications/unread-count',
        undefined,
        'GET',
        { signal }
      ),
    queryKey: ['notifications', 'unread-count'],
    retry: false,
    select: response => response.data
  })

  return {
    unreadCount: query.data?.unreadCount ?? 0
  }
}
