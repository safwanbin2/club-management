import './types/express.js'

import cors from 'cors'
import express from 'express'
import type { Express, RequestHandler } from 'express'

import { env } from './config/env.js'
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

function getConfiguredOrigins() {
  return [env.FRONTEND_ORIGIN, ...env.FRONTEND_ORIGINS.split(',')]
    .map(origin => origin.trim())
    .filter(Boolean)
}

function isDevelopmentLocalOrigin(origin: string) {
  if (env.NODE_ENV === 'production') {
    return false
  }

  try {
    const url = new URL(origin)
    const hostname = url.hostname
    const isLoopback = ['0.0.0.0', '127.0.0.1', '::1', 'localhost'].includes(hostname)
    const isPrivateNetwork =
      /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
      /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
      /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(hostname)

    return ['http:', 'https:'].includes(url.protocol) && (isLoopback || isPrivateNetwork)
  } catch {
    return false
  }
}

app.use(
  cors({
    credentials: true,
    origin(origin, callback) {
      if (!origin) {
        callback(null, true)
        return
      }

      const configuredOrigins = getConfiguredOrigins()

      callback(null, configuredOrigins.includes(origin) || isDevelopmentLocalOrigin(origin))
    }
  })
)
app.use(express.json())

app.use('/api', ensureDatabaseConnection, apiRoutes)
app.use(notFound)
app.use(errorHandler)

export default app
