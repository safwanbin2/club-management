import type { Request, Response } from 'express'

import { success } from '../../http/responses/index.js'
import * as resourceRequestService from './resource-request.service.js'
import type {
  CreateResourceRequestInput,
  ResourceRequestListQuery,
  ReviewResourceRequestInput
} from './resource-request.validation.js'

function getValidatedQuery<TQuery>(req: Request) {
  return req.validated?.query as TQuery
}

function getValidatedBody<TBody>(req: Request) {
  return req.validated?.body as TBody
}

function getRequestId(req: Request) {
  return (req.validated?.params as { requestId: string }).requestId
}

export async function index(req: Request, res: Response) {
  return success(
    res,
    await resourceRequestService.listResourceRequests(
      getValidatedQuery<ResourceRequestListQuery>(req),
      req.auth!.user
    )
  )
}

export async function analytics(req: Request, res: Response) {
  return success(res, await resourceRequestService.getResourceRequestAnalytics(req.auth!.user))
}

export async function manageableClubs(req: Request, res: Response) {
  return success(res, await resourceRequestService.listManageableResourceClubs(req.auth!.user))
}

export async function store(req: Request, res: Response) {
  return success(
    res,
    await resourceRequestService.createResourceRequest(
      getValidatedBody<CreateResourceRequestInput>(req),
      req.auth!.user
    ),
    'Resource request submitted',
    201
  )
}

export async function review(req: Request, res: Response) {
  return success(
    res,
    await resourceRequestService.reviewResourceRequest(
      getRequestId(req),
      getValidatedBody<ReviewResourceRequestInput>(req),
      req.auth!.user
    ),
    'Resource request reviewed'
  )
}
