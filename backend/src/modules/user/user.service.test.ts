import { describe, expect, it } from 'vitest'
import mongoose from 'mongoose'

import {
  getBadgePlans,
  getManagedProfileClubIds,
  getProfileManagedEventStatuses
} from './user.service.js'

describe('user.service badge rules', () => {
  it('awards core activity badges from profile stats', () => {
    const plans = getBadgePlans({
      activeMemberships: 2,
      communityMemberships: 1,
      executiveMemberships: 1,
      registeredEvents: 2
    })

    expect(plans.map(plan => plan.badgeType)).toEqual([
      'first_club_joined',
      'event_explorer',
      'executive_member',
      'volunteer',
      'community_leader'
    ])
  })

  it('awards event participation from registrations instead of attendance', () => {
    const plans = getBadgePlans({
      activeMemberships: 1,
      communityMemberships: 0,
      executiveMemberships: 0,
      registeredEvents: 1
    })

    expect(plans.map(plan => plan.badgeType)).toEqual(['first_club_joined', 'event_explorer'])
  })
})

describe('user.service profile event summary rules', () => {
  it('derives managed clubs from active executive and advisor memberships', () => {
    const executiveClubId = new mongoose.Types.ObjectId()
    const advisorClubId = new mongoose.Types.ObjectId()
    const memberClubId = new mongoose.Types.ObjectId()
    const pendingExecutiveClubId = new mongoose.Types.ObjectId()

    expect(
      getManagedProfileClubIds([
        {
          club: executiveClubId,
          clubRole: 'executive',
          status: 'active'
        },
        {
          club: advisorClubId,
          clubRole: 'advisor',
          status: 'active'
        },
        {
          club: memberClubId,
          clubRole: 'member',
          status: 'active'
        },
        {
          club: pendingExecutiveClubId,
          clubRole: 'executive',
          status: 'pending'
        }
      ]).map(clubId => clubId.toString())
    ).toEqual([executiveClubId.toString(), advisorClubId.toString()])
  })

  it('shows draft managed events only to the profile owner or university admins', () => {
    expect(getProfileManagedEventStatuses(true, false)).toEqual([
      'cancelled',
      'completed',
      'draft',
      'published'
    ])
    expect(getProfileManagedEventStatuses(false, true)).toEqual([
      'cancelled',
      'completed',
      'draft',
      'published'
    ])
    expect(getProfileManagedEventStatuses(false, false)).toEqual([
      'cancelled',
      'completed',
      'published'
    ])
  })
})
