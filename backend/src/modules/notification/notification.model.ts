import mongoose from 'mongoose'

import { defineModel } from '../../utils/define-model.js'
import type { Notification } from './notification.types.js'

const notificationSchema = new mongoose.Schema<Notification>(
  {
    body: {
      required: true,
      trim: true,
      type: String
    },
    link: {
      default: null,
      trim: true,
      type: String
    },
    metadata: {
      default: {},
      type: mongoose.Schema.Types.Mixed
    },
    readAt: {
      default: null,
      type: Date
    },
    recipient: {
      ref: 'User',
      required: true,
      type: mongoose.Schema.Types.ObjectId
    },
    title: {
      required: true,
      trim: true,
      type: String
    },
    type: {
      enum: [
        'announcement_published',
        'badge_earned',
        'event_reminder',
        'funding_approved',
        'membership_approved',
        'new_event',
        'poll_created',
        'poll_ending',
        'registration_confirmed',
        'waitlist_promoted'
      ],
      required: true,
      type: String
    }
  },
  {
    collection: 'notifications',
    timestamps: true
  }
)

notificationSchema.index({ recipient: 1, readAt: 1, createdAt: -1 })
notificationSchema.index({ recipient: 1, type: 1, createdAt: -1 })

export const NotificationModel = defineModel<Notification>('Notification', notificationSchema)
