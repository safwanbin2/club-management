import mongoose from 'mongoose'

import { defineModel } from '../../utils/define-model.js'
import type { Event } from './event.types.js'

const eventSchema = new mongoose.Schema<Event>(
  {
    bannerUrl: {
      default: null,
      trim: true,
      type: String
    },
    capacity: {
      min: 1,
      required: true,
      type: Number
    },
    club: {
      ref: 'Club',
      required: true,
      type: mongoose.Schema.Types.ObjectId
    },
    createdBy: {
      ref: 'User',
      required: true,
      type: mongoose.Schema.Types.ObjectId
    },
    deletedAt: {
      default: null,
      type: Date
    },
    description: {
      required: true,
      trim: true,
      type: String
    },
    endsAt: {
      required: true,
      type: Date
    },
    registrationDeadline: {
      required: true,
      type: Date
    },
    startsAt: {
      required: true,
      type: Date
    },
    status: {
      default: 'draft',
      enum: ['cancelled', 'completed', 'draft', 'published'],
      type: String
    },
    title: {
      required: true,
      trim: true,
      type: String
    },
    venue: {
      required: true,
      trim: true,
      type: String
    },
    visibility: {
      default: 'public',
      enum: ['members', 'public'],
      type: String
    }
  },
  {
    collection: 'events',
    timestamps: true
  }
)

eventSchema.index({ club: 1, startsAt: 1 })
eventSchema.index({ status: 1, startsAt: 1 })
eventSchema.index({ deletedAt: 1, status: 1 })
eventSchema.index({ title: 'text', description: 'text', venue: 'text' })

export const EventModel = defineModel<Event>('Event', eventSchema)
