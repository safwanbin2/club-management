import type { Request, Response } from 'express'

import { success } from '../../http/responses/index.js'
import * as userService from './user.service.js'
import type {
  ChangePasswordInput,
  UpdateAccountSettingsInput,
  UpdateOwnProfileInput
} from './user.validation.js'

function getValidatedBody<TBody>(req: Request) {
  return req.validated?.body as TBody
}

function getUserId(req: Request) {
  return (req.validated?.params as { userId: string }).userId
}

export async function ownProfile(req: Request, res: Response) {
  return success(res, await userService.getOwnProfile(req.auth!.user))
}

export async function publicProfile(req: Request, res: Response) {
  return success(res, await userService.getUserProfile(getUserId(req), req.auth!.user))
}

export async function updateProfile(req: Request, res: Response) {
  return success(
    res,
    await userService.updateOwnProfile(
      getValidatedBody<UpdateOwnProfileInput>(req),
      req.auth!.user
    ),
    'Profile updated'
  )
}

export async function settings(req: Request, res: Response) {
  return success(res, await userService.getAccountSettings(req.auth!.user))
}

export async function updateSettings(req: Request, res: Response) {
  return success(
    res,
    await userService.updateAccountSettings(
      getValidatedBody<UpdateAccountSettingsInput>(req),
      req.auth!.user
    ),
    'Account settings updated'
  )
}

export async function updatePassword(req: Request, res: Response) {
  return success(
    res,
    await userService.changePassword(getValidatedBody<ChangePasswordInput>(req), req.auth!.user),
    'Password changed'
  )
}
