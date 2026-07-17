import { Router } from 'express'
import type { Router as ExpressRouter } from 'express'

import { CAPABILITIES } from '../../constants/capabilities.js'
import { authenticate, requireCapability } from '../../http/middleware/authenticate.js'
import { asyncHandler } from '../../http/middleware/async-handler.js'
import { validate } from '../../http/middleware/validate.js'
import * as pollController from './poll.controller.js'
import {
  createPollSchema,
  pollListQuerySchema,
  pollParamsSchema,
  updatePollStatusSchema,
  votePollSchema
} from './poll.validation.js'

const router: ExpressRouter = Router()

router.use(authenticate)

router.get(
  '/',
  requireCapability(CAPABILITIES.pollsVote),
  validate({ query: pollListQuerySchema }),
  asyncHandler(pollController.index)
)

router.get(
  '/manageable-clubs',
  requireCapability(CAPABILITIES.pollsCreateClub),
  asyncHandler(pollController.manageableClubs)
)

router.post(
  '/',
  requireCapability(CAPABILITIES.pollsCreateClub),
  validate({ body: createPollSchema }),
  asyncHandler(pollController.store)
)

router.patch(
  '/:pollId/status',
  requireCapability(CAPABILITIES.pollsCreateClub),
  validate({ body: updatePollStatusSchema, params: pollParamsSchema }),
  asyncHandler(pollController.updateStatus)
)

router.post(
  '/:pollId/vote',
  requireCapability(CAPABILITIES.pollsVote),
  validate({ body: votePollSchema, params: pollParamsSchema }),
  asyncHandler(pollController.vote)
)

export default router
