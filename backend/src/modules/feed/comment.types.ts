import type { Types } from 'mongoose'

import type { ModerationStatus } from './post.types.js'

export type Comment = {
  author: Types.ObjectId
  body: string
  createdAt: Date
  deletedAt: Date | null
  moderationStatus: ModerationStatus
  post: Types.ObjectId
  updatedAt: Date
}
