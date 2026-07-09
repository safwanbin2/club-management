import type { Response } from 'express'

export function success<TData>(res: Response, data: TData, message = 'OK', statusCode = 200) {
  return res.status(statusCode).json({
    code: 'SUCCESS',
    data,
    message,
    status: 'success'
  })
}

export function error(res: Response, message: string, statusCode = 500, code = 'ERROR') {
  return res.status(statusCode).json({
    code,
    data: null,
    message,
    status: 'error'
  })
}

export function validation(res: Response, errors: Record<string, string[]>) {
  return res.status(422).json({
    code: 'VALIDATION',
    data: errors,
    message: 'Validation failed',
    status: 'error'
  })
}
