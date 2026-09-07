import { beforeEach, describe, expect, it, vi } from 'vitest'

import { hashToken } from './token.service.js'

const findOneSession = vi.fn()
const findOneUser = vi.fn()

vi.mock('./auth-session.model.js', () => ({
  AuthSessionModel: {
    findOne: (filter: unknown) => findOneSession(filter)
  }
}))

vi.mock('../user/user.model.js', () => ({
  UserModel: {
    findOne: (filter: unknown) => findOneUser(filter)
  },
  toUserDto: (user: { _id: string; email: string; name: string; role: string }) => ({
    email: user.email,
    id: user._id,
    name: user.name,
    role: user.role
  })
}))

const { refresh } = await import('./auth.service.js')

const user = { _id: 'user-1', email: 'student@eastdelta.edu.bd', name: 'Student', role: 'student' }
const context = { ipAddress: '127.0.0.1', userAgent: 'vitest' }

function createSession() {
  return {
    expiresAt: new Date(Date.now() + 60_000),
    ipAddress: null as null | string,
    refreshTokenHash: hashToken('refresh-token'),
    revokedAt: null as Date | null,
    save: vi.fn().mockResolvedValue(undefined),
    user: 'user-1',
    userAgent: null as null | string
  }
}

describe('auth.service refresh', () => {
  beforeEach(() => {
    findOneSession.mockReset()
    findOneUser.mockReset()
    findOneUser.mockResolvedValue(user)
  })

  it('keeps the same refresh token and slides the session expiry forward', async () => {
    const session = createSession()
    const previousExpiresAt = session.expiresAt
    findOneSession.mockImplementation((filter: { refreshTokenHash: string }) =>
      Promise.resolve(filter.refreshTokenHash === hashToken('refresh-token') ? session : null)
    )

    const result = await refresh('refresh-token', context)

    expect(result.user.id).toBe('user-1')
    expect(result.refreshToken).toBe('refresh-token')
    expect(session.refreshTokenHash).toBe(hashToken('refresh-token'))
    expect(session.expiresAt.getTime()).toBeGreaterThan(previousExpiresAt.getTime())
    expect(session.userAgent).toBe('vitest')
    expect(session.save).toHaveBeenCalledTimes(1)
  })

  it('succeeds repeatedly with the same token', async () => {
    const session = createSession()
    findOneSession.mockResolvedValue(session)

    await refresh('refresh-token', context)
    const result = await refresh('refresh-token', context)

    expect(result.refreshToken).toBe('refresh-token')
    expect(session.save).toHaveBeenCalledTimes(2)
  })

  it('rejects an unknown, expired, or revoked token', async () => {
    findOneSession.mockResolvedValue(null)

    await expect(refresh('stale-token', context)).rejects.toMatchObject({
      code: 'AUTH_SESSION_EXPIRED',
      statusCode: 401
    })
    expect(findOneUser).not.toHaveBeenCalled()
  })
})
