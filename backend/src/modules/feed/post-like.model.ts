import mongoose from 'mongoose'

import { defineModel } from '../../utils/define-model.js'
import type { PostLike } from './post-like.types.js'

const postLikeSchema = new mongoose.Schema<PostLike>(
  {
    post: {
      ref: 'Post',
      required: true,
      type: mongoose.Schema.Types.ObjectId
    },
    user: {
      ref: 'User',
      required: true,
      type: mongoose.Schema.Types.ObjectId
    }
  },
  {
    collection: 'post_likes',
    timestamps: true
  }
)

postLikeSchema.index({ post: 1, user: 1 }, { unique: true })
postLikeSchema.index({ user: 1, createdAt: -1 })

export const PostLikeModel = defineModel<PostLike>('PostLike', postLikeSchema)
