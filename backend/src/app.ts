import './types/express.js'

import cors from 'cors'
import express from 'express'
import type { Express } from 'express'

import { env } from './config/env.js'
import { errorHandler } from './http/middleware/error-handler.js'
import { notFound } from './http/middleware/not-found.js'
import apiRoutes from './http/routes.js'

const app: Express = express()

app.use(
  cors({
    credentials: true,
    origin: env.FRONTEND_ORIGIN
  })
)
app.use(express.json())

app.use('/api', apiRoutes)
app.use(notFound)
app.use(errorHandler)

export default app
