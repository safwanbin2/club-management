import type { UserDto } from '../modules/user/user.types.js'

declare global {
  // Express exposes Request augmentation through the global Express namespace.
  // eslint-disable-next-line @typescript-eslint/no-namespace
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
