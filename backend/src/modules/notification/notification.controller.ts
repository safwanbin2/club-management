import type { Request, Response } from 'express'

import { success } from '../../http/responses/index.js'
import * as notificationService from './notification.service.js'
import type { NotificationListQuery } from './notification.validation.js'

function getValidatedQuery<TQuery>(req: Request) {
  return req.validated?.query as TQuery
}

function getNotificationId(req: Request) {
  return (req.validated?.params as { notificationId: string }).notificationId
}

export async function index(req: Request, res: Response) {
  return success(
    res,
    await notificationService.listNotifications(
      getValidatedQuery<NotificationListQuery>(req),
      req.auth!.user
    )
  )
}

export async function unreadCount(req: Request, res: Response) {
  return success(res, await notificationService.getUnreadCount(req.auth!.user))
}

export async function markRead(req: Request, res: Response) {
  return success(
    res,
    await notificationService.markNotificationRead(getNotificationId(req), req.auth!.user),
    'Notification marked read'
  )
}

export async function markAllRead(req: Request, res: Response) {
  return success(
    res,
    await notificationService.markAllNotificationsRead(req.auth!.user),
    'Notifications marked read'
  )
}
