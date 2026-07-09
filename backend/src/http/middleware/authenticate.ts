import type { NextFunction, Request, Response } from 'express'

import { ApplicationError } from '../../utils/application-error.js'
import { UserModel, toUserDto, type UserDocument } from '../../modules/user/user.model.js'
import { verifyAccessToken } from '../../modules/auth/token.service.js'
import type { UserRole } from '../../constants/roles.js'
import { type Capability, roleHasCapability } from '../../constants/capabilities.js'

function readBearerToken(req: Request) {
  const header = req.get('authorization')

  if (!header?.startsWith('Bearer ')) {
    return null
  }

  return header.slice('Bearer '.length).trim()
}

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = readBearerToken(req)

    if (!token) {
      throw new ApplicationError('Authentication required.', 401, 'AUTH_REQUIRED')
    }

    const payload = verifyAccessToken(token)
    const user = (await UserModel.findOne({
      _id: payload.sub,
      deletedAt: null,
      status: 'active'
    })) as null | UserDocument

    if (!user) {
      throw new ApplicationError('Authentication required.', 401, 'AUTH_REQUIRED')
    }

    req.auth = {
      user: toUserDto(user)
    }

    return next()
  } catch (error) {
    return next(error)
  }
}

export function requireRole(roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) {
      return next(new ApplicationError('Authentication required.', 401, 'AUTH_REQUIRED'))
    }

    if (!roles.includes(req.auth.user.role)) {
      return next(
        new ApplicationError('You do not have access to this resource.', 403, 'FORBIDDEN')
      )
    }

    return next()
  }
}

export function requireCapability(capability: Capability) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) {
      return next(new ApplicationError('Authentication required.', 401, 'AUTH_REQUIRED'))
    }

    if (!roleHasCapability(req.auth.user.role, capability)) {
      return next(
        new ApplicationError('You do not have access to this resource.', 403, 'FORBIDDEN')
      )
    }

    return next()
  }
}
