import mongoose from 'mongoose'

import { defineModel } from '../../utils/define-model.js'
import type { PollVote } from './poll-vote.types.js'

const pollVoteSchema = new mongoose.Schema<PollVote>(
  {
    poll: {
      ref: 'Poll',
      required: true,
      type: mongoose.Schema.Types.ObjectId
    },
    selectedOptionIds: {
      required: true,
      type: [String]
    },
    user: {
      ref: 'User',
      required: true,
      type: mongoose.Schema.Types.ObjectId
    }
  },
  {
    collection: 'poll_votes',
    timestamps: true
  }
)

pollVoteSchema.index({ poll: 1, user: 1 }, { unique: true })
pollVoteSchema.index({ user: 1, createdAt: -1 })

export const PollVoteModel = defineModel<PollVote>('PollVote', pollVoteSchema)
