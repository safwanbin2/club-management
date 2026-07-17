import { Router } from 'express'
import type { Router as ExpressRouter } from 'express'

import { CAPABILITIES } from '../../constants/capabilities.js'
import { authenticate, requireCapability } from '../../http/middleware/authenticate.js'
import { asyncHandler } from '../../http/middleware/async-handler.js'
import { validate } from '../../http/middleware/validate.js'
import * as userController from './user.controller.js'
import {
  changePasswordSchema,
  updateAccountSettingsSchema,
  updateOwnProfileSchema,
  userProfileParamsSchema
} from './user.validation.js'

const router: ExpressRouter = Router()

router.use(authenticate)

router.get(
  '/me/profile',
  requireCapability(CAPABILITIES.profileManageOwn),
  asyncHandler(userController.ownProfile)
)

router.patch(
  '/me/profile',
  requireCapability(CAPABILITIES.profileManageOwn),
  validate({ body: updateOwnProfileSchema }),
  asyncHandler(userController.updateProfile)
)

router.get(
  '/me/settings',
  requireCapability(CAPABILITIES.profileManageOwn),
  asyncHandler(userController.settings)
)

router.patch(
  '/me/settings',
  requireCapability(CAPABILITIES.profileManageOwn),
  validate({ body: updateAccountSettingsSchema }),
  asyncHandler(userController.updateSettings)
)

router.patch(
  '/me/password',
  requireCapability(CAPABILITIES.profileManageOwn),
  validate({ body: changePasswordSchema }),
  asyncHandler(userController.updatePassword)
)

router.get(
  '/:userId/profile',
  requireCapability(CAPABILITIES.profilesViewPublic),
  validate({ params: userProfileParamsSchema }),
  asyncHandler(userController.publicProfile)
)

export default router
