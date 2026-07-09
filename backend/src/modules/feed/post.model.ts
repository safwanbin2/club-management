import mongoose from 'mongoose'

import { defineModel } from '../../utils/define-model.js'
import type { Post } from './post.types.js'

const postSchema = new mongoose.Schema<Post>(
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
    club: {
      default: null,
      ref: 'Club',
      type: mongoose.Schema.Types.ObjectId
    },
    commentCount: {
      default: 0,
      min: 0,
      type: Number
    },
    deletedAt: {
      default: null,
      type: Date
    },
    highlighted: {
      default: false,
      type: Boolean
    },
    images: {
      default: [],
      type: [String]
    },
    likeCount: {
      default: 0,
      min: 0,
      type: Number
    },
    moderationStatus: {
      default: 'visible',
      enum: ['deleted', 'flagged', 'hidden', 'visible'],
      type: String
    },
    pinned: {
      default: false,
      type: Boolean
    },
    relatedEvent: {
      default: null,
      ref: 'Event',
      type: mongoose.Schema.Types.ObjectId
    },
    relatedPoll: {
      default: null,
      ref: 'Poll',
      type: mongoose.Schema.Types.ObjectId
    },
    title: {
      default: null,
      trim: true,
      type: String
    },
    type: {
      default: 'post',
      enum: ['achievement', 'announcement', 'event', 'poll', 'post'],
      type: String
    },
    visibility: {
      default: 'public',
      enum: ['members', 'public'],
      type: String
    }
  },
  {
    collection: 'posts',
    timestamps: true
  }
)

postSchema.index({ club: 1, pinned: -1, createdAt: -1 })
postSchema.index({ createdAt: -1, moderationStatus: 1 })
postSchema.index({ type: 1, highlighted: 1 })
postSchema.index({ title: 'text', body: 'text' })

export const PostModel = defineModel<Post>('Post', postSchema)
