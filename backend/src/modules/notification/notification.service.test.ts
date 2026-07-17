import { describe, expect, it } from 'vitest'

import type { UserDto } from '../user/user.types.js'
import { USER_ROLES } from '../../constants/roles.js'
import { notificationListQuerySchema } from './notification.validation.js'

const actor: UserDto = {
  avatarUrl: null,
  createdAt: new Date().toISOString(),
  department: null,
  email: 'student@example.edu',
  id: '507f1f77bcf86cd799439011',
  lastLoginAt: null,
  name: 'Student',
  notificationPreferences: {
    emailDigest: true,
    eventReminders: true,
    inApp: true,
    membershipUpdates: true
  },
  profileVisibility: 'university',
  role: USER_ROLES.student,
  status: 'active',
  studentId: null
}

describe('notification.validation', () => {
  it('defaults notification list filters', () => {
    const result = notificationListQuerySchema.parse({})

    expect(result).toEqual({
      page: 1,
      perPage: 12,
      status: 'all'
    })
    expect(actor.role).toBe(USER_ROLES.student)
  })
})
