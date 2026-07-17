import type { Request, Response } from 'express'

import { success } from '../../http/responses/index.js'
import * as searchService from './search.service.js'
import type { SearchQuery } from './search.validation.js'

function getValidatedQuery<TQuery>(req: Request) {
  return req.validated?.query as TQuery
}

export async function index(req: Request, res: Response) {
  return success(
    res,
    await searchService.search(getValidatedQuery<SearchQuery>(req), req.auth!.user)
  )
}
