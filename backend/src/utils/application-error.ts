export class ApplicationError extends Error {
  code: string
  details?: unknown
  statusCode: number

  constructor(message: string, statusCode = 500, code = 'ERROR', details?: unknown) {
    super(message)
    this.code = code
    this.details = details
    this.statusCode = statusCode
  }
}
