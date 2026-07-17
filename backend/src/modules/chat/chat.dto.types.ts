import type { PaginatedResult } from '../../types/pagination.js'
import type { ChatAttachment } from './chat-message.types.js'

export type ChatClubDto = {
  category: string
  id: string
  lastMessageAt: string | null
  name: string
  slug: string
  unreadCount: number
}

export type ChatUserDto = {
  avatarUrl: string | null
  id: string
  name: string
  role: string
}

export type ChatMessageDto = {
  attachments: ChatAttachment[]
  author: ChatUserDto
  body: string
  canModerate: boolean
  clubId: string
  createdAt: string
  deletedAt: string | null
  id: string
  isOwn: boolean
  parentMessageId: string | null
  pinned: boolean
  seenCount: number
  updatedAt: string
}

export type ChatMessageListResult = PaginatedResult<ChatMessageDto>
