import type { Types } from 'mongoose'

export type ModerationStatus = 'deleted' | 'flagged' | 'hidden' | 'visible'

export type PostType = 'achievement' | 'announcement' | 'event' | 'poll' | 'post'

export type PostVisibility = 'members' | 'public'

export type Post = {
  author: Types.ObjectId
  body: string
  club: null | Types.ObjectId
  commentCount: number
  createdAt: Date
  deletedAt: Date | null
  highlighted: boolean
  images: string[]
  likeCount: number
  moderationStatus: ModerationStatus
  pinned: boolean
  relatedEvent: null | Types.ObjectId
  relatedPoll: null | Types.ObjectId
  title: null | string
  type: PostType
  updatedAt: Date
  visibility: PostVisibility
}
