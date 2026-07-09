import { Router } from 'express'
import type { Router as ExpressRouter } from 'express'

import { success } from './responses/index.js'

const router: ExpressRouter = Router()

router.get('/health', (_req, res) => {
  return success(res, {
    service: 'university-club-management-api'
  })
})

export default router
