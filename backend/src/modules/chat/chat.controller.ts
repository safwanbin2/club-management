import type { Request, Response } from 'express'

import { success } from '../../http/responses/index.js'
import * as chatService from './chat.service.js'
import type {
  ChatMessageListQuery,
  CreateChatMessageInput,
  MarkChatReadInput,
  ModerateChatMessageInput
} from './chat.validation.js'

function getValidatedQuery<TQuery>(req: Request) {
  return req.validated?.query as TQuery
}

function getValidatedBody<TBody>(req: Request) {
  return req.validated?.body as TBody
}

function getClubId(req: Request) {
  return (req.validated?.params as { clubId: string }).clubId
}

function getMessageId(req: Request) {
  return (req.validated?.params as { messageId: string }).messageId
}

export async function clubs(req: Request, res: Response) {
  return success(res, await chatService.listChatClubs(req.auth!.user))
}

export async function messages(req: Request, res: Response) {
  return success(
    res,
    await chatService.listChatMessages(
      getClubId(req),
      getValidatedQuery<ChatMessageListQuery>(req),
      req.auth!.user
    )
  )
}

export async function store(req: Request, res: Response) {
  return success(
    res,
    await chatService.createChatMessage(
      getClubId(req),
      getValidatedBody<CreateChatMessageInput>(req),
      req.auth!.user
    ),
    'Message sent',
    201
  )
}

export async function moderate(req: Request, res: Response) {
  return success(
    res,
    await chatService.moderateChatMessage(
      getMessageId(req),
      getValidatedBody<ModerateChatMessageInput>(req),
      req.auth!.user
    ),
    'Message updated'
  )
}

export async function markRead(req: Request, res: Response) {
  return success(
    res,
    await chatService.markChatRead(
      getClubId(req),
      getValidatedBody<MarkChatReadInput>(req),
      req.auth!.user
    ),
    'Messages marked read'
  )
}
