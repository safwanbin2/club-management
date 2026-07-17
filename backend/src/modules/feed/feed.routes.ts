import { Router } from 'express'
import type { Router as ExpressRouter } from 'express'

import { CAPABILITIES } from '../../constants/capabilities.js'
import { authenticate, requireCapability } from '../../http/middleware/authenticate.js'
import { asyncHandler } from '../../http/middleware/async-handler.js'
import { validate } from '../../http/middleware/validate.js'
import * as feedController from './feed.controller.js'
import {
  createFeedCommentSchema,
  createFeedPostSchema,
  feedCommentParamsSchema,
  feedCommentsQuerySchema,
  feedListQuerySchema,
  feedPostParamsSchema,
  moderateFeedCommentSchema,
  moderateFeedPostSchema
} from './feed.validation.js'

const router: ExpressRouter = Router()

router.use(authenticate)

router.get(
  '/',
  requireCapability(CAPABILITIES.feedView),
  validate({ query: feedListQuerySchema }),
  asyncHandler(feedController.index)
)

router.get(
  '/trending-clubs',
  requireCapability(CAPABILITIES.feedView),
  asyncHandler(feedController.trendingClubs)
)

router.get(
  '/manageable-clubs',
  requireCapability(CAPABILITIES.feedCreateClub),
  asyncHandler(feedController.manageableClubs)
)

router.post(
  '/posts',
  requireCapability(CAPABILITIES.feedCreateClub),
  validate({ body: createFeedPostSchema }),
  asyncHandler(feedController.store)
)

router.post(
  '/posts/:postId/like',
  requireCapability(CAPABILITIES.feedLike),
  validate({ params: feedPostParamsSchema }),
  asyncHandler(feedController.toggleLike)
)

router.get(
  '/posts/:postId/comments',
  requireCapability(CAPABILITIES.feedView),
  validate({ params: feedPostParamsSchema, query: feedCommentsQuerySchema }),
  asyncHandler(feedController.comments)
)

router.post(
  '/posts/:postId/comments',
  requireCapability(CAPABILITIES.commentsCreate),
  validate({ body: createFeedCommentSchema, params: feedPostParamsSchema }),
  asyncHandler(feedController.storeComment)
)

router.patch(
  '/posts/:postId/moderation',
  requireCapability(CAPABILITIES.feedModerateClub),
  validate({ body: moderateFeedPostSchema, params: feedPostParamsSchema }),
  asyncHandler(feedController.moderatePost)
)

router.patch(
  '/posts/:postId/comments/:commentId/moderation',
  requireCapability(CAPABILITIES.commentsModerateClub),
  validate({ body: moderateFeedCommentSchema, params: feedCommentParamsSchema }),
  asyncHandler(feedController.moderateComment)
)

export default router
