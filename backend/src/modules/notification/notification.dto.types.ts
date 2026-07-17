import type { PaginatedResult } from '../../types/pagination.js'
import type { NotificationType } from './notification.types.js'

export type NotificationDto = {
  body: string
  createdAt: string
  id: string
  link: null | string
  metadata: Record<string, unknown>
  readAt: null | string
  title: string
  type: NotificationType
  updatedAt: string
}

export type NotificationListResult = PaginatedResult<NotificationDto>

export type NotificationUnreadCountDto = {
  unreadCount: number
}
