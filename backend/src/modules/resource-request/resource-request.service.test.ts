import { describe, expect, it } from 'vitest'

import { ApplicationError } from '../../utils/application-error.js'
import { assertResourceRequestDetails } from './resource-request.service.js'
import type { CreateResourceRequestInput } from './resource-request.validation.js'

const baseRequest = {
  clubId: 'robotics-club',
  details: {
    description: 'Requesting support for the next club program.',
    title: 'Program support'
  }
} satisfies Omit<CreateResourceRequestInput, 'type'>

describe('resource-request.service request detail rules', () => {
  it('requires an amount for funding requests', () => {
    expect(() =>
      assertResourceRequestDetails({
        ...baseRequest,
        type: 'funding'
      })
    ).toThrow(ApplicationError)

    expect(() =>
      assertResourceRequestDetails({
        ...baseRequest,
        details: { ...baseRequest.details, amount: 2500 },
        type: 'funding'
      })
    ).not.toThrow()
  })

  it('requires room and date details for room bookings', () => {
    expect(() =>
      assertResourceRequestDetails({
        ...baseRequest,
        type: 'room_booking'
      })
    ).toThrow(ApplicationError)

    expect(() =>
      assertResourceRequestDetails({
        ...baseRequest,
        details: {
          ...baseRequest.details,
          requestedDate: '2026-07-20T10:00:00.000Z',
          room: 'Main Auditorium'
        },
        type: 'room_booking'
      })
    ).not.toThrow()
  })
})
