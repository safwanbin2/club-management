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
      enum: ['cancelled', 'registered', 'waitlisted'],
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

export const EventRegistrationModel = defineModel<EventRegistration>(
  'EventRegistration',
  eventRegistrationSchema
)
