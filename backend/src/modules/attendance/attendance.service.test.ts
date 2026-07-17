import { describe, expect, it } from 'vitest'

import { createAttendanceToken, verifyAttendanceToken } from './attendance.service.js'

describe('attendance.service token helpers', () => {
  it('round-trips a signed attendance token', () => {
    const payload = {
      eventId: '507f1f77bcf86cd799439011',
      exp: Date.now() + 60_000
    }
    const token = createAttendanceToken(payload, 'test-secret')

    expect(verifyAttendanceToken(token, 'test-secret')).toEqual(payload)
  })

  it('rejects tokens signed with another secret', () => {
    const token = createAttendanceToken(
      {
        eventId: '507f1f77bcf86cd799439011',
        exp: Date.now() + 60_000
      },
      'test-secret'
    )

    expect(() => verifyAttendanceToken(token, 'other-secret')).toThrow()
  })
})
