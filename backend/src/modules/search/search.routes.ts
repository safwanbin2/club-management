import { Router } from 'express'
import type { Router as ExpressRouter } from 'express'

import { CAPABILITIES } from '../../constants/capabilities.js'
import { authenticate, requireCapability } from '../../http/middleware/authenticate.js'
import { asyncHandler } from '../../http/middleware/async-handler.js'
import { validate } from '../../http/middleware/validate.js'
import * as searchController from './search.controller.js'
import { searchQuerySchema } from './search.validation.js'

const router: ExpressRouter = Router()

router.use(authenticate)

router.get(
  '/',
  requireCapability(CAPABILITIES.searchGlobal),
  validate({ query: searchQuerySchema }),
  asyncHandler(searchController.index)
)

export default router
