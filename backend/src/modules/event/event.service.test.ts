import { describe, expect, it } from 'vitest'

import {
  getInitialRegistrationPlacement,
  getRegistrationPlacement,
  getReviewedRegistrationPlacement,
  shouldPromoteFromWaitlist
} from './event.service.js'

describe('event.service waitlist rules', () => {
  it('registers directly while capacity is available', () => {
    expect(getRegistrationPlacement(4, 5, 2)).toEqual({
      status: 'registered',
      waitlistPosition: null
    })
  })

  it('places users at the end of the waitlist when capacity is full', () => {
    expect(getRegistrationPlacement(5, 5, 2)).toEqual({
      status: 'waitlisted',
      waitlistPosition: 3
    })
  })

  it('keeps paid registrations pending until executive review', () => {
    expect(
      getInitialRegistrationPlacement({
        capacity: 5,
        feeAmount: 250,
        registeredCount: 1,
        waitlistedCount: 0
      })
    ).toEqual({
      status: 'pending',
      waitlistPosition: null
    })
  })

  it('places approved paid registrations by capacity during review', () => {
    expect(getReviewedRegistrationPlacement(5, 5, 2)).toEqual({
      status: 'waitlisted',
      waitlistPosition: 3
    })
  })

  it('promotes the waitlist only when a registered attendee cancels', () => {
    expect(shouldPromoteFromWaitlist('registered')).toBe(true)
    expect(shouldPromoteFromWaitlist('waitlisted')).toBe(false)
    expect(shouldPromoteFromWaitlist('pending')).toBe(false)
    expect(shouldPromoteFromWaitlist('declined')).toBe(false)
    expect(shouldPromoteFromWaitlist('cancelled')).toBe(false)
  })
})
