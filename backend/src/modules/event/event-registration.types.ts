import type { Types } from 'mongoose'

export type EventRegistrationStatus = 'cancelled' | 'registered' | 'waitlisted'

export type EventRegistration = {
  cancellationReason: null | string
  cancelledAt: Date | null
  createdAt: Date
  event: Types.ObjectId
  promotedAt: Date | null
  registeredAt: Date
  status: EventRegistrationStatus
  updatedAt: Date
  user: Types.ObjectId
  waitlistPosition: null | number
}
