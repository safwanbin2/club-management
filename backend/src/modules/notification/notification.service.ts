import type { FilterQuery, Types } from 'mongoose'
import mongoose from 'mongoose'

import type { PaginatedResult } from '../../types/pagination.js'
import { ApplicationError } from '../../utils/application-error.js'
import type { UserDto } from '../user/user.types.js'
import { NotificationModel } from './notification.model.js'
import type { Notification } from './notification.types.js'
import type { NotificationDto, NotificationListResult } from './notification.dto.types.js'
import type { NotificationListQuery } from './notification.validation.js'

type NotificationLean = Notification & {
  _id: Types.ObjectId
}

const defaultPagination = {
  currentPage: 1,
  currentTotal: 0,
  data: [],
  lastPage: 1,
  perPage: 10,
  total: 0
} satisfies PaginatedResult<unknown>

function toObjectId(id: string) {
  return new mongoose.Types.ObjectId(id)
}

function isObjectId(value: string) {
  return mongoose.Types.ObjectId.isValid(value)
}

function getPagination<TItem>(
  data: TItem[],
  total: number,
  page: number,
  perPage: number
): PaginatedResult<TItem> {
  return {
    currentPage: page,
    currentTotal: data.length,
    data,
    lastPage: Math.max(Math.ceil(total / perPage), 1),
    perPage,
    total
  }
}

function toNotificationDto(notification: NotificationLean): NotificationDto {
  return {
    body: notification.body,
    createdAt: notification.createdAt.toISOString(),
    id: notification._id.toString(),
    link: notification.link ?? null,
    metadata: notification.metadata,
    readAt: notification.readAt ? notification.readAt.toISOString() : null,
    title: notification.title,
    type: notification.type,
    updatedAt: notification.updatedAt.toISOString()
  }
}

function buildFilter(query: NotificationListQuery, actor: UserDto): FilterQuery<Notification> {
  const filter: FilterQuery<Notification> = {
    recipient: toObjectId(actor.id)
  }

  if (query.status === 'read') {
    filter.readAt = { $ne: null }
  }

  if (query.status === 'unread') {
    filter.readAt = null
  }

  return filter
}

export async function listNotifications(
  query: NotificationListQuery,
  actor: UserDto
): Promise<NotificationListResult> {
  const filter = buildFilter(query, actor)
  const skip = (query.page - 1) * query.perPage
  const [total, notifications] = await Promise.all([
    NotificationModel.countDocuments(filter),
    NotificationModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(query.perPage).lean()
  ])
  const rows = notifications as NotificationLean[]

  if (rows.length === 0) {
    return {
      ...defaultPagination,
      currentPage: query.page,
      perPage: query.perPage,
      total
    } as NotificationListResult
  }

  return getPagination(rows.map(toNotificationDto), total, query.page, query.perPage)
}

export async function getUnreadCount(actor: UserDto) {
  return {
    unreadCount: await NotificationModel.countDocuments({
      readAt: null,
      recipient: toObjectId(actor.id)
    })
  }
}

export async function markNotificationRead(notificationId: string, actor: UserDto) {
  if (!isObjectId(notificationId)) {
    throw new ApplicationError('Notification not found.', 404, 'NOTIFICATION_NOT_FOUND')
  }

  const notification = (await NotificationModel.findOneAndUpdate(
    {
      _id: toObjectId(notificationId),
      recipient: toObjectId(actor.id)
    },
    {
      $set: {
        readAt: new Date()
      }
    },
    { new: true }
  ).lean()) as NotificationLean | null

  if (!notification) {
    throw new ApplicationError('Notification not found.', 404, 'NOTIFICATION_NOT_FOUND')
  }

  return toNotificationDto(notification)
}

export async function markAllNotificationsRead(actor: UserDto) {
  const now = new Date()
  const result = await NotificationModel.updateMany(
    {
      readAt: null,
      recipient: toObjectId(actor.id)
    },
    {
      $set: {
        readAt: now
      }
    }
  )

  return {
    markedRead: result.modifiedCount
  }
}
