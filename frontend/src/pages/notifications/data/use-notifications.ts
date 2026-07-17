import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import { buildSearchParams } from '../shared/helpers'
import type { NotificationListPayload, NotificationListResponse } from '../shared/types'

export default function useNotifications(payload: NotificationListPayload) {
  const query = useQuery({
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) =>
      request<ApiResponse<NotificationListResponse>>(
        `notifications?${buildSearchParams(payload)}`,
        undefined,
        'GET',
        { signal }
      ),
    queryKey: ['notifications', 'list', payload],
    retry: false,
    select: response => response.data
  })

  return {
    currentNotificationPage: query.data?.currentPage ?? payload.page,
    isNotificationsError: query.isError,
    isNotificationsFetching: query.isFetching,
    isNotificationsPending: query.isPending,
    lastNotificationPage: query.data?.lastPage ?? 1,
    notifications: query.data?.data ?? [],
    refetchNotifications: query.refetch,
    totalNotifications: query.data?.total ?? 0
  }
}
