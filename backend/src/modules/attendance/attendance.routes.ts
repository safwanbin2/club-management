import { Router } from 'express'
import type { Router as ExpressRouter } from 'express'

import { CAPABILITIES } from '../../constants/capabilities.js'
import { authenticate, requireCapability } from '../../http/middleware/authenticate.js'
import { asyncHandler } from '../../http/middleware/async-handler.js'
import { validate } from '../../http/middleware/validate.js'
import * as attendanceController from './attendance.controller.js'
import {
  attendanceEventParamsSchema,
  attendanceHistoryQuerySchema,
  attendanceReportQuerySchema,
  checkInSchema
} from './attendance.validation.js'

const router: ExpressRouter = Router()

router.use(authenticate)

router.get(
  '/manageable-events',
  requireCapability(CAPABILITIES.attendanceManage),
  asyncHandler(attendanceController.manageableEvents)
)

router.post(
  '/events/:eventId/token',
  requireCapability(CAPABILITIES.attendanceManage),
  validate({ params: attendanceEventParamsSchema }),
  asyncHandler(attendanceController.token)
)

router.get(
  '/events/:eventId/report',
  requireCapability(CAPABILITIES.attendanceManage),
  validate({ params: attendanceEventParamsSchema, query: attendanceReportQuerySchema }),
  asyncHandler(attendanceController.report)
)

router.post(
  '/check-in',
  requireCapability(CAPABILITIES.attendanceCheckIn),
  validate({ body: checkInSchema }),
  asyncHandler(attendanceController.checkIn)
)

router.get(
  '/history',
  requireCapability(CAPABILITIES.attendanceViewOwn),
  validate({ query: attendanceHistoryQuerySchema }),
  asyncHandler(attendanceController.history)
)

export default router
