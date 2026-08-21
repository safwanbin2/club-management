import { Router } from 'express'
import type { Router as ExpressRouter } from 'express'

import { CAPABILITIES } from '../../constants/capabilities.js'
import { authenticate, requireCapability } from '../../http/middleware/authenticate.js'
import { asyncHandler } from '../../http/middleware/async-handler.js'
import { validate } from '../../http/middleware/validate.js'
import * as eventController from './event.controller.js'
import {
  cancelRegistrationSchema,
  createEventSchema,
  eventRegistrationReviewParamsSchema,
  eventListQuerySchema,
  eventParamsSchema,
  eventRegistrationsQuerySchema,
  registerEventSchema,
  reviewEventRegistrationSchema,
  updateEventSchema
} from './event.validation.js'

const router: ExpressRouter = Router()

router.use(authenticate)

router.get(
  '/',
  requireCapability(CAPABILITIES.eventsView),
  validate({ query: eventListQuerySchema }),
  asyncHandler(eventController.index)
)

router.get(
  '/manageable-clubs',
  requireCapability(CAPABILITIES.eventsManageClub),
  asyncHandler(eventController.manageableClubs)
)

router.post(
  '/',
  requireCapability(CAPABILITIES.eventsManageClub),
  validate({ body: createEventSchema }),
  asyncHandler(eventController.store)
)

router.get(
  '/:eventId',
  requireCapability(CAPABILITIES.eventsView),
  validate({ params: eventParamsSchema }),
  asyncHandler(eventController.show)
)

router.patch(
  '/:eventId',
  requireCapability(CAPABILITIES.eventsManageClub),
  validate({ body: updateEventSchema, params: eventParamsSchema }),
  asyncHandler(eventController.update)
)

router.delete(
  '/:eventId',
  requireCapability(CAPABILITIES.eventsManageClub),
  validate({ params: eventParamsSchema }),
  asyncHandler(eventController.destroy)
)

router.post(
  '/:eventId/register',
  requireCapability(CAPABILITIES.eventsRegister),
  validate({ body: registerEventSchema, params: eventParamsSchema }),
  asyncHandler(eventController.register)
)

router.post(
  '/:eventId/cancel-registration',
  requireCapability(CAPABILITIES.eventsRegister),
  validate({ body: cancelRegistrationSchema, params: eventParamsSchema }),
  asyncHandler(eventController.cancelRegistration)
)

router.get(
  '/:eventId/registrations',
  requireCapability(CAPABILITIES.eventsManageClub),
  validate({ params: eventParamsSchema, query: eventRegistrationsQuerySchema }),
  asyncHandler(eventController.registrations)
)

router.patch(
  '/:eventId/registrations/:registrationId/review',
  requireCapability(CAPABILITIES.eventsManageClub),
  validate({
    body: reviewEventRegistrationSchema,
    params: eventRegistrationReviewParamsSchema
  }),
  asyncHandler(eventController.reviewRegistration)
)

export default router
