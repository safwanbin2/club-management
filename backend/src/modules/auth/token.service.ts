import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

import { env } from '../../config/env.js'
import { ApplicationError } from '../../utils/application-error.js'
import type { UserDto } from '../user/user.types.js'
import type { AccessTokenPayload } from './auth.types.js'

function base64UrlEncode(value: Buffer | string) {
  return Buffer.from(value).toString('base64url')
}

function base64UrlJson(value: unknown) {
  return base64UrlEncode(JSON.stringify(value))
}

function sign(value: string) {
  return createHmac('sha256', env.ACCESS_TOKEN_SECRET).update(value).digest('base64url')
}

function safeEquals(a: string, b: string) {
  const first = Buffer.from(a)
  const second = Buffer.from(b)

  return first.length === second.length && timingSafeEqual(first, second)
}

export function signAccessToken(user: UserDto) {
  const issuedAt = Math.floor(Date.now() / 1000)
  const expiresAt = issuedAt + env.ACCESS_TOKEN_TTL_SECONDS
  const header = base64UrlJson({ alg: 'HS256', typ: 'JWT' })
  const payload = base64UrlJson({
    email: user.email,
    exp: expiresAt,
    iat: issuedAt,
    name: user.name,
    role: user.role,
    sub: user.id
  } satisfies AccessTokenPayload)
  const unsignedToken = `${header}.${payload}`

  return {
    expiresAt: new Date(expiresAt * 1000),
    token: `${unsignedToken}.${sign(unsignedToken)}`
  }
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const [header, payload, signature] = token.split('.')

  if (!header || !payload || !signature) {
    throw new ApplicationError('Invalid access token', 401, 'AUTH_INVALID_TOKEN')
  }

  const expectedSignature = sign(`${header}.${payload}`)

  if (!safeEquals(signature, expectedSignature)) {
    throw new ApplicationError('Invalid access token', 401, 'AUTH_INVALID_TOKEN')
  }

  const parsedPayload = JSON.parse(
    Buffer.from(payload, 'base64url').toString()
  ) as AccessTokenPayload
  const now = Math.floor(Date.now() / 1000)

  if (parsedPayload.exp <= now) {
    throw new ApplicationError('Access token expired', 401, 'AUTH_TOKEN_EXPIRED')
  }

  return parsedPayload
}

export function createOpaqueToken() {
  return randomBytes(48).toString('base64url')
}

export function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export function getRefreshExpiry() {
  return new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000)
}

export function getResetExpiry() {
  return new Date(Date.now() + env.RESET_TOKEN_TTL_MINUTES * 60 * 1000)
}
