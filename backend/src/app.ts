import './types/express.js'

import cors from 'cors'
import express from 'express'
import type { Express, RequestHandler } from 'express'

import { connectDatabase } from './db/mongoose.js'
import { errorHandler } from './http/middleware/error-handler.js'
import { notFound } from './http/middleware/not-found.js'
import apiRoutes from './http/routes.js'

const app: Express = express()

const ensureDatabaseConnection: RequestHandler = async (_req, _res, next) => {
  try {
    await connectDatabase()
    next()
  } catch (error) {
    next(error)
  }
}

const openCorsOptions = {
  credentials: true,
  origin: true,
  optionsSuccessStatus: 204
}

app.use(cors(openCorsOptions))
app.use(express.json())

app.use('/api', ensureDatabaseConnection, apiRoutes)
app.use(notFound)
app.use(errorHandler)

export default app
