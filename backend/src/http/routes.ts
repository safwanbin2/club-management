import { Router } from 'express'
import type { Router as ExpressRouter } from 'express'

import authRoutes from '../modules/auth/auth.routes.js'
import clubRoutes from '../modules/club/club.routes.js'
import dashboardRoutes from '../modules/dashboard/dashboard.routes.js'
import { success } from './responses/index.js'

const router: ExpressRouter = Router()

router.get('/health', (_req, res) => {
  return success(res, {
    service: 'university-club-management-api'
  })
})

router.use('/auth', authRoutes)
router.use('/clubs', clubRoutes)
router.use('/dashboard', dashboardRoutes)

export default router
