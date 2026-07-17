import { Router } from 'express'
import type { Router as ExpressRouter } from 'express'

import { CAPABILITIES } from '../../constants/capabilities.js'
import { authenticate, requireCapability } from '../../http/middleware/authenticate.js'
import { asyncHandler } from '../../http/middleware/async-handler.js'
import { validate } from '../../http/middleware/validate.js'
import * as resourceRequestController from './resource-request.controller.js'
import {
  createResourceRequestSchema,
  resourceRequestListQuerySchema,
  resourceRequestParamsSchema,
  reviewResourceRequestSchema
} from './resource-request.validation.js'

const router: ExpressRouter = Router()

router.use(authenticate)

router.get(
  '/',
  requireCapability(CAPABILITIES.resourceRequestsCreateClub),
  validate({ query: resourceRequestListQuerySchema }),
  asyncHandler(resourceRequestController.index)
)

router.get(
  '/analytics',
  requireCapability(CAPABILITIES.resourceRequestsCreateClub),
  asyncHandler(resourceRequestController.analytics)
)

router.get(
  '/manageable-clubs',
  requireCapability(CAPABILITIES.resourceRequestsCreateClub),
  asyncHandler(resourceRequestController.manageableClubs)
)

router.post(
  '/',
  requireCapability(CAPABILITIES.resourceRequestsCreateClub),
  validate({ body: createResourceRequestSchema }),
  asyncHandler(resourceRequestController.store)
)

router.patch(
  '/:requestId/review',
  requireCapability(CAPABILITIES.resourceRequestsApprove),
  validate({ body: reviewResourceRequestSchema, params: resourceRequestParamsSchema }),
  asyncHandler(resourceRequestController.review)
)

export default router
