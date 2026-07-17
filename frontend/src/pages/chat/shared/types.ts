import type { PaginatedData } from '@common/types/api'
import type { UserRole } from '@common/constants/roles'
import type { ClubCategory } from '@pages/clubs/shared/types'

export type ChatAttachment = {
  name: string
  size: number
  type: 'image' | 'other'
  url: string
}

export type ChatClub = {
  category: ClubCategory
  id: string
  lastMessageAt: null | string
  name: string
  slug: string
  unreadCount: number
}

export type ChatUser = {
  avatarUrl: null | string
  id: string
  name: string
  role: UserRole
}

export type ChatMessage = {
  attachments: ChatAttachment[]
  author: ChatUser
  body: string
  canModerate: boolean
  clubId: string
  createdAt: string
  deletedAt: null | string
  id: string
  isOwn: boolean
  parentMessageId: null | string
  pinned: boolean
  seenCount: number
  updatedAt: string
}

export type ChatMessageListResponse = PaginatedData<ChatMessage>

export type SendChatMessagePayload = {
  attachments?: ChatAttachment[]
  body: string
  clubId: string
  parentMessageId?: string
}

export type ModerateChatMessagePayload = {
  action: 'delete' | 'pin' | 'unpin'
  messageId: string
}

export type MarkChatReadPayload = {
  clubId: string
  messageIds: string[]
}
