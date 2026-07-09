import mongoose from 'mongoose'

import { defineModel } from '../../utils/define-model.js'
import type { ResourceRequest } from './resource-request.types.js'

const resourceRequestSchema = new mongoose.Schema<ResourceRequest>(
  {
    club: {
      ref: 'Club',
      required: true,
      type: mongoose.Schema.Types.ObjectId
    },
    details: {
      amount: {
        min: 0,
        type: Number
      },
      description: {
        required: true,
        trim: true,
        type: String
      },
      requestedDate: {
        type: Date
      },
      room: {
        trim: true,
        type: String
      },
      title: {
        required: true,
        trim: true,
        type: String
      }
    },
    remarks: {
      default: null,
      trim: true,
      type: String
    },
    requestedBy: {
      ref: 'User',
      required: true,
      type: mongoose.Schema.Types.ObjectId
    },
    reviewedAt: {
      default: null,
      type: Date
    },
    reviewer: {
      default: null,
      ref: 'User',
      type: mongoose.Schema.Types.ObjectId
    },
    status: {
      default: 'pending',
      enum: ['approved', 'pending', 'rejected'],
      type: String
    },
    type: {
      enum: ['funding', 'room_booking'],
      required: true,
      type: String
    }
  },
  {
    collection: 'resource_requests',
    timestamps: true
  }
)

resourceRequestSchema.index({ club: 1, status: 1, createdAt: -1 })
resourceRequestSchema.index({ requestedBy: 1, createdAt: -1 })
resourceRequestSchema.index({ status: 1, type: 1, createdAt: -1 })

export const ResourceRequestModel = defineModel<ResourceRequest>(
  'ResourceRequest',
  resourceRequestSchema
)
