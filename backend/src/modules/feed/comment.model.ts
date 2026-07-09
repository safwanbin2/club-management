import mongoose from 'mongoose'

import { defineModel } from '../../utils/define-model.js'
import type { Comment } from './comment.types.js'

const commentSchema = new mongoose.Schema<Comment>(
  {
    author: {
      ref: 'User',
      required: true,
      type: mongoose.Schema.Types.ObjectId
    },
    body: {
      required: true,
      trim: true,
      type: String
    },
    deletedAt: {
      default: null,
      type: Date
    },
    moderationStatus: {
      default: 'visible',
      enum: ['deleted', 'flagged', 'hidden', 'visible'],
      type: String
    },
    post: {
      ref: 'Post',
      required: true,
      type: mongoose.Schema.Types.ObjectId
    }
  },
  {
    collection: 'comments',
    timestamps: true
  }
)

commentSchema.index({ post: 1, createdAt: 1 })
commentSchema.index({ author: 1, createdAt: -1 })
commentSchema.index({ moderationStatus: 1, deletedAt: 1 })

export const CommentModel = defineModel<Comment>('Comment', commentSchema)
