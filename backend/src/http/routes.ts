import { Router } from 'express'
import type { Router as ExpressRouter } from 'express'

import authRoutes from '../modules/auth/auth.routes.js'
import chatRoutes from '../modules/chat/chat.routes.js'
import clubRoutes from '../modules/club/club.routes.js'
import dashboardRoutes from '../modules/dashboard/dashboard.routes.js'
import eventRoutes from '../modules/event/event.routes.js'
import feedRoutes from '../modules/feed/feed.routes.js'
import notificationRoutes from '../modules/notification/notification.routes.js'
import pollRoutes from '../modules/poll/poll.routes.js'
import resourceRequestRoutes from '../modules/resource-request/resource-request.routes.js'
import searchRoutes from '../modules/search/search.routes.js'
import userRoutes from '../modules/user/user.routes.js'
import { success } from './responses/index.js'

const router: ExpressRouter = Router()

router.get('/health', (_req, res) => {
  return success(res, {
    service: 'university-club-management-api'
  })
})

router.use('/auth', authRoutes)
router.use('/chat', chatRoutes)
router.use('/clubs', clubRoutes)
router.use('/dashboard', dashboardRoutes)
router.use('/events', eventRoutes)
router.use('/feed', feedRoutes)
router.use('/notifications', notificationRoutes)
router.use('/polls', pollRoutes)
router.use('/resource-requests', resourceRequestRoutes)
router.use('/search', searchRoutes)
router.use('/users', userRoutes)

export default router
