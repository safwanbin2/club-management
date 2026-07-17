import type { Request, Response } from 'express'

import { success } from '../../http/responses/index.js'
import * as pollService from './poll.service.js'
import type {
  CreatePollInput,
  PollListQuery,
  UpdatePollStatusInput,
  VotePollInput
} from './poll.validation.js'

function getValidatedQuery<TQuery>(req: Request) {
  return req.validated?.query as TQuery
}

function getValidatedBody<TBody>(req: Request) {
  return req.validated?.body as TBody
}

function getPollId(req: Request) {
  return (req.validated?.params as { pollId: string }).pollId
}

export async function index(req: Request, res: Response) {
  return success(
    res,
    await pollService.listPolls(getValidatedQuery<PollListQuery>(req), req.auth!.user)
  )
}

export async function manageableClubs(req: Request, res: Response) {
  return success(res, await pollService.listManageablePollClubs(req.auth!.user))
}

export async function store(req: Request, res: Response) {
  return success(
    res,
    await pollService.createPoll(getValidatedBody<CreatePollInput>(req), req.auth!.user),
    'Poll created',
    201
  )
}

export async function updateStatus(req: Request, res: Response) {
  return success(
    res,
    await pollService.updatePollStatus(
      getPollId(req),
      getValidatedBody<UpdatePollStatusInput>(req),
      req.auth!.user
    ),
    'Poll updated'
  )
}

export async function vote(req: Request, res: Response) {
  return success(
    res,
    await pollService.votePoll(
      getPollId(req),
      getValidatedBody<VotePollInput>(req),
      req.auth!.user
    ),
    'Vote recorded'
  )
}
