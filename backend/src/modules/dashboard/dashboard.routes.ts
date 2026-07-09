import { Router } from 'express'
import type { Router as ExpressRouter } from 'express'

import { authenticate } from '../../http/middleware/authenticate.js'
import { asyncHandler } from '../../http/middleware/async-handler.js'
import * as dashboardController from './dashboard.controller.js'

const router: ExpressRouter = Router()

router.get('/summary', authenticate, asyncHandler(dashboardController.summary))

export default router
