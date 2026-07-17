import { describe, expect, it } from 'vitest'

import { getBadgePlans } from './user.service.js'

describe('user.service badge rules', () => {
  it('awards core activity badges from profile stats', () => {
    const plans = getBadgePlans({
      activeMemberships: 2,
      attendanceCount: 2,
      communityMemberships: 1,
      executiveMemberships: 1,
      registeredEvents: 2
    })

    expect(plans.map(plan => plan.badgeType)).toEqual([
      'first_club_joined',
      'event_explorer',
      'executive_member',
      'volunteer',
      'perfect_attendance',
      'community_leader'
    ])
  })

  it('does not award attendance badges without attendance', () => {
    const plans = getBadgePlans({
      activeMemberships: 1,
      attendanceCount: 0,
      communityMemberships: 0,
      executiveMemberships: 0,
      registeredEvents: 1
    })

    expect(plans.map(plan => plan.badgeType)).toEqual(['first_club_joined'])
  })
})
