import { describe, expect, it } from 'vitest'

import { USER_ROLES } from '../../constants/roles.js'
import type { UserDto } from '../user/user.types.js'
import { getDashboardSummarySkeleton } from './dashboard.service.js'

function buildUser(role: UserDto['role']): UserDto {
  return {
    avatarUrl: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z').toISOString(),
    department: 'Computer Science',
    email: `${role}@example.edu`,
    id: role,
    lastLoginAt: null,
    name: 'Aisha Rahman',
    profileVisibility: 'university',
    role,
    status: 'active',
    studentId: '2026-1234'
  }
}

describe('dashboard.service', () => {
  it('returns student workspace content for students', () => {
    const summary = getDashboardSummarySkeleton(buildUser(USER_ROLES.student))

    expect(summary.hero.eyebrow).toBe('Student Workspace')
    expect(summary.metrics.map(metric => metric.label)).toContain('Joined Clubs')
  })

  it('returns administration content for university admins', () => {
    const summary = getDashboardSummarySkeleton(buildUser(USER_ROLES.universityAdmin))

    expect(summary.hero.eyebrow).toBe('University Administration')
    expect(summary.metrics.map(metric => metric.label)).toContain('Pending Approvals')
  })
})
