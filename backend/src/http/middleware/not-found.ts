import type { RequestHandler } from 'express'

export const notFound: RequestHandler = (req, res) => {
  res.status(404).json({
    code: 'NOT_FOUND',
    data: null,
    message: `Route ${req.method} ${req.originalUrl} was not found`,
    status: 'error'
  })
}
