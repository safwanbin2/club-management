import mongoose from 'mongoose'

import { defineModel } from '../../utils/define-model.js'
import type { Membership } from './membership.types.js'

const membershipSchema = new mongoose.Schema<Membership>(
  {
    approvedAt: {
      default: null,
      type: Date
    },
    club: {
      ref: 'Club',
      required: true,
      type: mongoose.Schema.Types.ObjectId
    },
    clubRole: {
      default: 'member',
      enum: ['advisor', 'executive', 'member'],
      type: String
    },
    executivePosition: {
      default: null,
      trim: true,
      type: String
    },
    feeStatus: {
      default: 'not_required',
      enum: ['not_required', 'paid', 'unpaid', 'waived'],
      type: String
    },
    leftAt: {
      default: null,
      type: Date
    },
    rejectedAt: {
      default: null,
      type: Date
    },
    remarks: {
      default: null,
      trim: true,
      type: String
    },
    requestedAt: {
      default: Date.now,
      required: true,
      type: Date
    },
    reviewedBy: {
      default: null,
      ref: 'User',
      type: mongoose.Schema.Types.ObjectId
    },
    status: {
      default: 'pending',
      enum: ['active', 'left', 'pending', 'rejected'],
      type: String
    },
    user: {
      ref: 'User',
      required: true,
      type: mongoose.Schema.Types.ObjectId
    }
  },
  {
    collection: 'memberships',
    timestamps: true
  }
)

membershipSchema.index({ club: 1, status: 1 })
membershipSchema.index({ club: 1, clubRole: 1, status: 1 })
membershipSchema.index({ user: 1, status: 1 })
membershipSchema.index({ user: 1, club: 1 }, { unique: true })

export const MembershipModel = defineModel<Membership>('Membership', membershipSchema)
