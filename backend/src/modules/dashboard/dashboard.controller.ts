import type { Request, Response } from 'express'

import { success } from '../../http/responses/index.js'
import { getDashboardSummary } from './dashboard.service.js'

export async function summary(req: Request, res: Response) {
  return success(res, await getDashboardSummary(req.auth!.user))
}
