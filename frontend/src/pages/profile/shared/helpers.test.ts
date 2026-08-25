import { describe, expect, it } from 'vitest'

import { normalizeProfileDetail } from './helpers'
import type { UserProfileDetailPayload } from './types'

function createProfilePayload(): UserProfileDetailPayload {
  return {
    activityTimeline: [],
    badges: [],
    clubs: [],
    executivePositions: [],
    isOwnProfile: true,
    user: {
      avatarUrl: null,
      department: null,
      email: 'student@example.edu',
      id: 'user-1',
      name: 'Safwan Ahmed',
      profileVisibility: 'public',
      role: 'student',
      status: 'active',
      studentId: null
    }
  }
}

describe('profile helpers', () => {
  it('normalizes legacy profile payloads without an event summary', () => {
    expect(normalizeProfileDetail(createProfilePayload()).eventSummary).toEqual({
      joinedCount: 0,
      joinedEvents: [],
      managedCount: 0,
      managedEvents: []
    })
  })
})
