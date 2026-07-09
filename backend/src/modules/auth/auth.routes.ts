import { Router } from 'express'
import type { Router as ExpressRouter } from 'express'

import { authenticate } from '../../http/middleware/authenticate.js'
import { asyncHandler } from '../../http/middleware/async-handler.js'
import { validate } from '../../http/middleware/validate.js'
import * as authController from './auth.controller.js'
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema
} from './auth.validation.js'

const router: ExpressRouter = Router()

router.post('/register', validate({ body: registerSchema }), asyncHandler(authController.register))
router.post('/login', validate({ body: loginSchema }), asyncHandler(authController.login))
router.post('/refresh', asyncHandler(authController.refresh))
router.post('/logout', asyncHandler(authController.logout))
router.get('/me', authenticate, authController.me)
router.post(
  '/forgot-password',
  validate({ body: forgotPasswordSchema }),
  asyncHandler(authController.forgotPassword)
)
router.post(
  '/reset-password',
  validate({ body: resetPasswordSchema }),
  asyncHandler(authController.resetPassword)
)

export default router
