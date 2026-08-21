import type { Types } from 'mongoose'

export type EventRegistrationStatus =
  | 'cancelled'
  | 'declined'
  | 'pending'
  | 'registered'
  | 'waitlisted'

export type EventRegistrationPaymentMethod = 'bkash_send_money' | null

export type EventRegistration = {
  cancellationReason: null | string
  cancelledAt: Date | null
  createdAt: Date
  event: Types.ObjectId
  paymentMethod: EventRegistrationPaymentMethod
  paymentReviewedAt: Date | null
  paymentReviewedBy: null | Types.ObjectId
  paymentReviewRemarks: null | string
  paymentSubmittedAt: Date | null
  paymentTransactionId: null | string
  promotedAt: Date | null
  registeredAt: Date
  status: EventRegistrationStatus
  updatedAt: Date
  user: Types.ObjectId
  waitlistPosition: null | number
}
