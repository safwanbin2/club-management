import mongoose from 'mongoose'

import { defineModel } from '../../utils/define-model.js'
import type { Badge } from './badge.types.js'

const badgeSchema = new mongoose.Schema<Badge>(
  {
    badgeType: {
      enum: [
        'community_leader',
        'event_explorer',
        'executive_member',
        'first_club_joined',
        'perfect_attendance',
        'volunteer'
      ],
      required: true,
      type: String
    },
    description: {
      required: true,
      trim: true,
      type: String
    },
    earnedAt: {
      default: Date.now,
      required: true,
      type: Date
    },
    icon: {
      required: true,
      trim: true,
      type: String
    },
    metadata: {
      default: {},
      type: mongoose.Schema.Types.Mixed
    },
    sourceActivityId: {
      default: null,
      trim: true,
      type: String
    },
    title: {
      required: true,
      trim: true,
      type: String
    },
    user: {
      ref: 'User',
      required: true,
      type: mongoose.Schema.Types.ObjectId
    }
  },
  {
    collection: 'badges',
    timestamps: true
  }
)

badgeSchema.index({ user: 1, earnedAt: -1 })
badgeSchema.index({ user: 1, badgeType: 1, sourceActivityId: 1 }, { unique: true })

export const BadgeModel = defineModel<Badge>('Badge', badgeSchema)
