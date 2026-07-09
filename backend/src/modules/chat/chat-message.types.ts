import type { Types } from 'mongoose'

export type ChatAttachment = {
  name: string
  size: number
  type: 'image' | 'other'
  url: string
}

export type ChatMessage = {
  attachments: ChatAttachment[]
  author: Types.ObjectId
  body: string
  club: Types.ObjectId
  createdAt: Date
  deletedAt: Date | null
  parentMessage: null | Types.ObjectId
  pinned: boolean
  seenBy: {
    seenAt: Date
    user: Types.ObjectId
  }[]
  updatedAt: Date
}
