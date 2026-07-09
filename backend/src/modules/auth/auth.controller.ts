import type { Request, Response } from 'express'

import { env } from '../../config/env.js'
import { success } from '../../http/responses/index.js'
import { ApplicationError } from '../../utils/application-error.js'
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput
} from './auth.types.js'
import * as authService from './auth.service.js'

const REFRESH_COOKIE = 'ucms_refresh_token'

function getRequestContext(req: Request) {
  return {
    ipAddress: req.ip,
    userAgent: req.get('user-agent')
  }
}

function getValidatedBody<TBody>(req: Request) {
  return req.validated?.body as TBody
}

function readCookie(req: Request, name: string) {
  const cookieHeader = req.get('cookie')

  if (!cookieHeader) {
    return undefined
  }

  return cookieHeader
    .split(';')
    .map(cookie => cookie.trim())
    .map(cookie => cookie.split('=') as [string, string | undefined])
    .find(([cookieName]) => cookieName === name)?.[1]
}

function readRefreshToken(req: Request) {
  return readCookie(req, REFRESH_COOKIE)
}

function setRefreshCookie(res: Response, refreshToken: string, expiresAt: Date) {
  res.cookie(REFRESH_COOKIE, refreshToken, {
    expires: expiresAt,
    httpOnly: true,
    path: '/api/auth',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: env.NODE_ENV === 'production'
  })
}

function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE, {
    httpOnly: true,
    path: '/api/auth',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: env.NODE_ENV === 'production'
  })
}

function sendAuthResult(
  res: Response,
  result: Awaited<ReturnType<typeof authService.login>>,
  message: string
) {
  setRefreshCookie(res, result.refreshToken, result.refreshTokenExpiresAt)

  return success(
    res,
    {
      accessToken: result.accessToken,
      accessTokenExpiresAt: result.accessTokenExpiresAt,
      user: result.user
    },
    message
  )
}

export async function register(req: Request, res: Response) {
  const result = await authService.register(
    getValidatedBody<RegisterInput>(req),
    getRequestContext(req)
  )
  return sendAuthResult(res, result, 'Account created')
}

export async function login(req: Request, res: Response) {
  const result = await authService.login(getValidatedBody<LoginInput>(req), getRequestContext(req))
  return sendAuthResult(res, result, 'Signed in')
}

export async function refresh(req: Request, res: Response) {
  const refreshToken = readRefreshToken(req)

  if (!refreshToken) {
    throw new ApplicationError(
      'Session expired. Please sign in again.',
      401,
      'AUTH_SESSION_EXPIRED'
    )
  }

  const result = await authService.refresh(refreshToken, getRequestContext(req))
  return sendAuthResult(res, result, 'Session refreshed')
}

export async function logout(req: Request, res: Response) {
  await authService.logout(readRefreshToken(req))
  clearRefreshCookie(res)
  return success(res, null, 'Signed out')
}

export function me(req: Request, res: Response) {
  return success(res, {
    user: req.auth?.user
  })
}

export async function forgotPassword(req: Request, res: Response) {
  const result = await authService.forgotPassword(getValidatedBody<ForgotPasswordInput>(req))
  return success(res, result, 'Password reset instructions sent')
}

export async function resetPassword(req: Request, res: Response) {
  await authService.resetPassword(getValidatedBody<ResetPasswordInput>(req))
  clearRefreshCookie(res)
  return success(res, null, 'Password updated')
}
