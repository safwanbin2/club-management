import { Router } from 'express'
import type { Router as ExpressRouter } from 'express'

import { CAPABILITIES } from '../../constants/capabilities.js'
import { authenticate, requireCapability } from '../../http/middleware/authenticate.js'
import { asyncHandler } from '../../http/middleware/async-handler.js'
import { validate } from '../../http/middleware/validate.js'
import * as notificationController from './notification.controller.js'
import { notificationListQuerySchema, notificationParamsSchema } from './notification.validation.js'

const router: ExpressRouter = Router()

router.use(authenticate)

router.get(
  '/',
  requireCapability(CAPABILITIES.notificationsViewOwn),
  validate({ query: notificationListQuerySchema }),
  asyncHandler(notificationController.index)
)

router.get(
  '/unread-count',
  requireCapability(CAPABILITIES.notificationsViewOwn),
  asyncHandler(notificationController.unreadCount)
)

router.patch(
  '/read-all',
  requireCapability(CAPABILITIES.notificationsViewOwn),
  asyncHandler(notificationController.markAllRead)
)

router.patch(
  '/:notificationId/read',
  requireCapability(CAPABILITIES.notificationsViewOwn),
  validate({ params: notificationParamsSchema }),
  asyncHandler(notificationController.markRead)
)

export default router
