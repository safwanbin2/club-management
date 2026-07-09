import type { UserDto } from '../modules/user/user.types.js'

declare global {
  namespace Express {
    interface Request {
      auth?: {
        user: UserDto
      }
      validated?: {
        body?: unknown
        params?: unknown
        query?: unknown
      }
    }
  }
}

export {}
