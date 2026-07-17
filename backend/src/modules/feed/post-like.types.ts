import type { Types } from 'mongoose'

export type PostLike = {
  createdAt: Date
  post: Types.ObjectId
  updatedAt: Date
  user: Types.ObjectId
}
