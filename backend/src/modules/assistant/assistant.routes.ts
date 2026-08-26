import { Router } from 'express'
import type { Router as ExpressRouter } from 'express'

import { CAPABILITIES } from '../../constants/capabilities.js'
import { authenticate, requireCapability } from '../../http/middleware/authenticate.js'
import { asyncHandler } from '../../http/middleware/async-handler.js'
import { validate } from '../../http/middleware/validate.js'
import * as assistantController from './assistant.controller.js'
import { assistantChatSchema, assistantRunParamsSchema } from './assistant.validation.js'

const router: ExpressRouter = Router()

router.use(authenticate)

router.post(
  '/chat',
  requireCapability(CAPABILITIES.assistantChat),
  validate({ body: assistantChatSchema }),
  asyncHandler(assistantController.chat)
)

router.get(
  '/chat/:runId',
  requireCapability(CAPABILITIES.assistantChat),
  validate({ params: assistantRunParamsSchema }),
  asyncHandler(assistantController.getRun)
)

export default router
