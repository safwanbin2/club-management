import { z } from 'zod'

export const notificationListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(50).default(12),
  status: z.enum(['all', 'read', 'unread']).default('all')
})

export const notificationParamsSchema = z.object({
  notificationId: z.string().trim().min(1, 'Notification is required.')
})

export type NotificationListQuery = z.infer<typeof notificationListQuerySchema>
