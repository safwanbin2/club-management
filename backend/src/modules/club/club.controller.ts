import type { Request, Response } from 'express'

import { success } from '../../http/responses/index.js'
import type {
  ClubListQuery,
  ClubMembershipRequestsQuery,
  ReviewMembershipInput
} from './club.validation.js'
import * as clubService from './club.service.js'

function getValidatedQuery<TQuery>(req: Request) {
  return req.validated?.query as TQuery
}

function getValidatedBody<TBody>(req: Request) {
  return req.validated?.body as TBody
}

function getClubId(req: Request) {
  return (req.validated?.params as { clubId: string }).clubId
}

function getMembershipId(req: Request) {
  return (req.validated?.params as { membershipId: string }).membershipId
}

export async function index(req: Request, res: Response) {
  return success(
    res,
    await clubService.listClubs(getValidatedQuery<ClubListQuery>(req), req.auth!.user)
  )
}

export async function show(req: Request, res: Response) {
  return success(res, await clubService.getClubDetail(getClubId(req), req.auth!.user))
}

export async function requestMembership(req: Request, res: Response) {
  return success(
    res,
    await clubService.requestMembership(getClubId(req), req.auth!.user),
    'Membership request submitted'
  )
}

export async function leave(req: Request, res: Response) {
  return success(res, await clubService.leaveClub(getClubId(req), req.auth!.user), 'Club left')
}

export async function membershipRequests(req: Request, res: Response) {
  return success(
    res,
    await clubService.listMembershipRequests(
      getClubId(req),
      getValidatedQuery<ClubMembershipRequestsQuery>(req),
      req.auth!.user
    )
  )
}

export async function reviewMembership(req: Request, res: Response) {
  return success(
    res,
    await clubService.reviewMembershipRequest(
      getClubId(req),
      getMembershipId(req),
      getValidatedBody<ReviewMembershipInput>(req),
      req.auth!.user
    ),
    'Membership request reviewed'
  )
}
