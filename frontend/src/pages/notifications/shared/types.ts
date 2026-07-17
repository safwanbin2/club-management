import type { PaginatedData } from '@common/types/api'

export type NotificationItem = {
  body: string
  createdAt: string
  id: string
  link: null | string
  metadata: Record<string, unknown>
  readAt: null | string
  title: string
  type: string
  updatedAt: string
}

export type NotificationStatus = 'all' | 'read' | 'unread'

export type NotificationListPayload = {
  page: number
  perPage: number
  status: NotificationStatus
}

export type NotificationListResponse = PaginatedData<NotificationItem>

export type NotificationUnreadCount = {
  unreadCount: number
}
