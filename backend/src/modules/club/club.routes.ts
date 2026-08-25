import { Router } from 'express'
import type { Router as ExpressRouter } from 'express'

import { CAPABILITIES } from '../../constants/capabilities.js'
import { authenticate, requireCapability } from '../../http/middleware/authenticate.js'
import { asyncHandler } from '../../http/middleware/async-handler.js'
import { validate } from '../../http/middleware/validate.js'
import * as clubController from './club.controller.js'
import {
  clubListQuerySchema,
  clubMembersQuerySchema,
  clubMembershipRoleParamsSchema,
  clubMembershipRequestsQuerySchema,
  clubMembershipReviewParamsSchema,
  clubParamsSchema,
  createClubSchema,
  reviewMembershipSchema,
  updateClubSchema,
  updateMembershipRoleSchema
} from './club.validation.js'

const router: ExpressRouter = Router()

router.use(authenticate)

router.get(
  '/',
  requireCapability(CAPABILITIES.clubsBrowse),
  validate({ query: clubListQuerySchema }),
  asyncHandler(clubController.index)
)

router.post(
  '/',
  requireCapability(CAPABILITIES.clubsCreate),
  validate({ body: createClubSchema }),
  asyncHandler(clubController.store)
)

router.get(
  '/:clubId',
  requireCapability(CAPABILITIES.clubsBrowse),
  validate({ params: clubParamsSchema }),
  asyncHandler(clubController.show)
)

router.patch(
  '/:clubId',
  requireCapability(CAPABILITIES.clubsManageOwn),
  validate({ body: updateClubSchema, params: clubParamsSchema }),
  asyncHandler(clubController.update)
)

router.post(
  '/:clubId/memberships/request',
  requireCapability(CAPABILITIES.clubsJoin),
  validate({ params: clubParamsSchema }),
  asyncHandler(clubController.requestMembership)
)

router.post(
  '/:clubId/memberships/leave',
  requireCapability(CAPABILITIES.clubsLeave),
  validate({ params: clubParamsSchema }),
  asyncHandler(clubController.leave)
)

router.get(
  '/:clubId/memberships',
  requireCapability(CAPABILITIES.clubsBrowse),
  validate({ params: clubParamsSchema, query: clubMembersQuerySchema }),
  asyncHandler(clubController.members)
)

router.get(
  '/:clubId/memberships/requests',
  requireCapability(CAPABILITIES.membershipsViewClub),
  validate({ params: clubParamsSchema, query: clubMembershipRequestsQuerySchema }),
  asyncHandler(clubController.membershipRequests)
)

router.patch(
  '/:clubId/memberships/requests/:membershipId',
  requireCapability(CAPABILITIES.membershipsApproveClub),
  validate({
    body: reviewMembershipSchema,
    params: clubMembershipReviewParamsSchema
  }),
  asyncHandler(clubController.reviewMembership)
)

router.patch(
  '/:clubId/memberships/:membershipId/role',
  requireCapability(CAPABILITIES.membershipsApproveClub),
  validate({
    body: updateMembershipRoleSchema,
    params: clubMembershipRoleParamsSchema
  }),
  asyncHandler(clubController.updateMembershipRole)
)

export default router
