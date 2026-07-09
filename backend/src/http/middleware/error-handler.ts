import type { ErrorRequestHandler } from 'express'

import { ApplicationError } from '../../utils/application-error.js'

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ApplicationError) {
    return res.status(error.statusCode).json({
      code: error.code,
      data: error.details ?? null,
      message: error.message,
      status: 'error'
    })
  }

  console.error(error)

  return res.status(500).json({
    code: 'INTERNAL_SERVER_ERROR',
    data: null,
    message: 'Internal server error',
    status: 'error'
  })
}
