import type { Types } from 'mongoose'

export type PollVote = {
  createdAt: Date
  poll: Types.ObjectId
  selectedOptionIds: string[]
  updatedAt: Date
  user: Types.ObjectId
}
