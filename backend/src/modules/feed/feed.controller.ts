import type { Request, Response } from 'express'

import { success } from '../../http/responses/index.js'
import * as feedService from './feed.service.js'
import type {
  CreateFeedCommentInput,
  CreateFeedPostInput,
  FeedCommentsQuery,
  FeedListQuery,
  ModerateFeedCommentInput,
  ModerateFeedPostInput
} from './feed.validation.js'

function getValidatedQuery<TQuery>(req: Request) {
  return req.validated?.query as TQuery
}

function getValidatedBody<TBody>(req: Request) {
  return req.validated?.body as TBody
}

function getPostId(req: Request) {
  return (req.validated?.params as { postId: string }).postId
}

function getCommentId(req: Request) {
  return (req.validated?.params as { commentId: string }).commentId
}

export async function index(req: Request, res: Response) {
  return success(
    res,
    await feedService.listFeedPosts(getValidatedQuery<FeedListQuery>(req), req.auth!.user)
  )
}

export async function trendingClubs(req: Request, res: Response) {
  return success(res, await feedService.listTrendingClubs(req.auth!.user))
}

export async function manageableClubs(req: Request, res: Response) {
  return success(res, await feedService.listManageableClubs(req.auth!.user))
}

export async function store(req: Request, res: Response) {
  return success(
    res,
    await feedService.createFeedPost(getValidatedBody<CreateFeedPostInput>(req), req.auth!.user),
    'Post published',
    201
  )
}

export async function toggleLike(req: Request, res: Response) {
  return success(res, await feedService.togglePostLike(getPostId(req), req.auth!.user))
}

export async function comments(req: Request, res: Response) {
  return success(
    res,
    await feedService.listPostComments(
      getPostId(req),
      getValidatedQuery<FeedCommentsQuery>(req),
      req.auth!.user
    )
  )
}

export async function storeComment(req: Request, res: Response) {
  return success(
    res,
    await feedService.createPostComment(
      getPostId(req),
      getValidatedBody<CreateFeedCommentInput>(req),
      req.auth!.user
    ),
    'Comment posted',
    201
  )
}

export async function moderatePost(req: Request, res: Response) {
  return success(
    res,
    await feedService.moderatePost(
      getPostId(req),
      getValidatedBody<ModerateFeedPostInput>(req),
      req.auth!.user
    ),
    'Post updated'
  )
}

export async function moderateComment(req: Request, res: Response) {
  return success(
    res,
    await feedService.moderateComment(
      getPostId(req),
      getCommentId(req),
      getValidatedBody<ModerateFeedCommentInput>(req),
      req.auth!.user
    ),
    'Comment updated'
  )
}
