import mongoose from 'mongoose'

import { defineModel } from '../../utils/define-model.js'
import type { Poll } from './poll.types.js'

const pollOptionSchema = new mongoose.Schema(
  {
    id: {
      required: true,
      trim: true,
      type: String
    },
    label: {
      required: true,
      trim: true,
      type: String
    },
    voteCount: {
      default: 0,
      min: 0,
      type: Number
    }
  },
  {
    _id: false
  }
)

const pollSchema = new mongoose.Schema<Poll>(
  {
    closesAt: {
      required: true,
      type: Date
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
    options: {
      required: true,
      type: [pollOptionSchema],
      validate: {
        message: 'Poll requires at least two options.',
        validator: (options: unknown[]) => options.length >= 2
      }
    },
    question: {
      required: true,
      trim: true,
      type: String
    },
    status: {
      default: 'open',
      enum: ['closed', 'draft', 'open'],
      type: String
    },
    totalVotes: {
      default: 0,
      min: 0,
      type: Number
    },
    type: {
      default: 'single_choice',
      enum: ['multiple_choice', 'single_choice'],
      type: String
    },
    visibility: {
      default: 'public',
      enum: ['anonymous', 'public'],
      type: String
    }
  },
  {
    collection: 'polls',
    timestamps: true
  }
)

pollSchema.index({ club: 1, status: 1, closesAt: 1 })
pollSchema.index({ deletedAt: 1, status: 1 })

export const PollModel = defineModel<Poll>('Poll', pollSchema)
