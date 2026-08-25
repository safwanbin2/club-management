import mongoose from 'mongoose'

import { defineModel } from '../../utils/define-model.js'
import type { EventRegistration } from './event-registration.types.js'

const eventRegistrationSchema = new mongoose.Schema<EventRegistration>(
  {
    cancellationReason: {
      default: null,
      trim: true,
      type: String
    },
    cancelledAt: {
      default: null,
      type: Date
    },
    event: {
      ref: 'Event',
      required: true,
      type: mongoose.Schema.Types.ObjectId
    },
    paymentMethod: {
      default: null,
      enum: ['bkash_send_money', null],
      type: String
    },
    paymentReviewedAt: {
      default: null,
      type: Date
    },
    paymentReviewedBy: {
      default: null,
      ref: 'User',
      type: mongoose.Schema.Types.ObjectId
    },
    paymentReviewRemarks: {
      default: null,
      trim: true,
      type: String
    },
    paymentSubmittedAt: {
      default: null,
      type: Date
    },
    paymentTransactionId: {
      default: null,
      trim: true,
      type: String
    },
    promotedAt: {
      default: null,
      type: Date
    },
    registeredAt: {
      default: Date.now,
      required: true,
      type: Date
    },
    status: {
      default: 'registered',
      enum: ['cancelled', 'declined', 'pending', 'registered', 'waitlisted'],
      type: String
    },
    user: {
      ref: 'User',
      required: true,
      type: mongoose.Schema.Types.ObjectId
    },
    waitlistPosition: {
      default: null,
      min: 1,
      type: Number
    }
  },
  {
    collection: 'event_registrations',
    timestamps: true
  }
)

eventRegistrationSchema.index({ event: 1, status: 1, registeredAt: 1 })
eventRegistrationSchema.index({ event: 1, user: 1 }, { unique: true })
eventRegistrationSchema.index({ user: 1, status: 1 })
eventRegistrationSchema.index({ event: 1, waitlistPosition: 1 })
eventRegistrationSchema.index({ event: 1, paymentTransactionId: 1 })

export const EventRegistrationModel = defineModel<EventRegistration>(
  'EventRegistration',
  eventRegistrationSchema
)
