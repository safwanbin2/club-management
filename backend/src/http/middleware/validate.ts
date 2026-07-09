import type { NextFunction, Request, Response } from 'express'
import type { ZodError, ZodTypeAny } from 'zod'

import { validation } from '../responses/index.js'

type ValidationSchemas = {
  body?: ZodTypeAny
  params?: ZodTypeAny
  query?: ZodTypeAny
}

function formatZodErrors(error: ZodError) {
  return error.issues.reduce<Record<string, string[]>>((errors, issue) => {
    const path = issue.path.join('.') || 'form'
    errors[path] = [...(errors[path] ?? []), issue.message]
    return errors
  }, {})
}

export function validate(schemas: ValidationSchemas) {
  return (req: Request, res: Response, next: NextFunction) => {
    const validated: NonNullable<Request['validated']> = {}

    for (const [scope, schema] of Object.entries(schemas) as [
      keyof ValidationSchemas,
      ZodTypeAny
    ][]) {
      const result = schema.safeParse(req[scope])

      if (!result.success) {
        return validation(res, formatZodErrors(result.error))
      }

      validated[scope] = result.data
    }

    req.validated = validated
    return next()
  }
}
