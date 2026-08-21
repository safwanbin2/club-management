import { describe, expect, it } from 'vitest'

import { ApplicationError } from '../../utils/application-error.js'
import {
  assertMembershipCanLeave,
  getMembershipRequestPlan,
  getMembershipRoleUpdatePlan
} from './club.service.js'

describe('club.service membership rules', () => {
  it('creates a pending request for a new membership', () => {
    const requestedAt = new Date('2026-07-10T10:00:00.000Z')
    const plan = getMembershipRequestPlan(null, requestedAt)

    expect(plan.kind).toBe('create-or-reopen')

    if (plan.kind === 'create-or-reopen') {
      expect(plan.updates.status).toBe('pending')
      expect(plan.updates.requestedAt).toBe(requestedAt)
      expect(plan.updates.clubRole).toBe('member')
    }
  })

  it('keeps an existing pending request instead of duplicating it', () => {
    const plan = getMembershipRequestPlan({
      clubRole: 'member',
      status: 'pending'
    })

    expect(plan.kind).toBe('already-pending')
  })

  it('blocks requesting membership when the user is already active', () => {
    expect(() =>
      getMembershipRequestPlan({
        clubRole: 'member',
        status: 'active'
      })
    ).toThrow(ApplicationError)
  })

  it('allows active student members and pending requesters to leave', () => {
    expect(() => assertMembershipCanLeave({ clubRole: 'member', status: 'active' })).not.toThrow()
    expect(() => assertMembershipCanLeave({ clubRole: 'member', status: 'pending' })).not.toThrow()
  })

  it('blocks active executives from leaving before assignment transfer', () => {
    expect(() => assertMembershipCanLeave({ clubRole: 'executive', status: 'active' })).toThrow(
      ApplicationError
    )
  })

  it('promotes an active member to executive with a position', () => {
    expect(
      getMembershipRoleUpdatePlan(
        { clubRole: 'member', executivePosition: null, status: 'active' },
        { clubRole: 'executive', executivePosition: 'Treasurer' }
      )
    ).toEqual({
      clubRole: 'executive',
      executivePosition: 'Treasurer'
    })
  })

  it('requires a position when promoting an executive', () => {
    expect(() =>
      getMembershipRoleUpdatePlan(
        { clubRole: 'member', executivePosition: null, status: 'active' },
        { clubRole: 'executive', executivePosition: '' }
      )
    ).toThrow(ApplicationError)
  })

  it('demotes an executive to member and clears the position', () => {
    expect(
      getMembershipRoleUpdatePlan(
        { clubRole: 'executive', executivePosition: 'Treasurer', status: 'active' },
        { clubRole: 'member' }
      )
    ).toEqual({
      clubRole: 'member',
      executivePosition: null
    })
  })

  it('blocks role changes for inactive memberships', () => {
    expect(() =>
      getMembershipRoleUpdatePlan(
        { clubRole: 'member', executivePosition: null, status: 'pending' },
        { clubRole: 'executive', executivePosition: 'Secretary' }
      )
    ).toThrow(ApplicationError)
  })
})
