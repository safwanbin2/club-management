import { Router } from 'express'
import type { Router as ExpressRouter } from 'express'

import { CAPABILITIES } from '../../constants/capabilities.js'
import { authenticate, requireCapability } from '../../http/middleware/authenticate.js'
import { asyncHandler } from '../../http/middleware/async-handler.js'
import { validate } from '../../http/middleware/validate.js'
import * as chatController from './chat.controller.js'
import {
  chatClubParamsSchema,
  chatMessageListQuerySchema,
  chatMessageParamsSchema,
  createChatMessageSchema,
  markChatReadSchema,
  moderateChatMessageSchema
} from './chat.validation.js'

const router: ExpressRouter = Router()

router.use(authenticate)

router.get(
  '/clubs',
  requireCapability(CAPABILITIES.chatAccessClub),
  asyncHandler(chatController.clubs)
)

router.get(
  '/clubs/:clubId/messages',
  requireCapability(CAPABILITIES.chatAccessClub),
  validate({ params: chatClubParamsSchema, query: chatMessageListQuerySchema }),
  asyncHandler(chatController.messages)
)

router.post(
  '/clubs/:clubId/messages',
  requireCapability(CAPABILITIES.chatAccessClub),
  validate({ body: createChatMessageSchema, params: chatClubParamsSchema }),
  asyncHandler(chatController.store)
)

router.post(
  '/clubs/:clubId/read',
  requireCapability(CAPABILITIES.chatAccessClub),
  validate({ body: markChatReadSchema, params: chatClubParamsSchema }),
  asyncHandler(chatController.markRead)
)

router.patch(
  '/messages/:messageId/moderation',
  requireCapability(CAPABILITIES.chatModerateClub),
  validate({ body: moderateChatMessageSchema, params: chatMessageParamsSchema }),
  asyncHandler(chatController.moderate)
)

export default router
