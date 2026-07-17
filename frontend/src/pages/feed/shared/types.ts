import type { PaginatedData } from '@common/types/api'
import type { UserRole } from '@common/constants/roles'
import type { ClubCategory } from '@pages/clubs/shared/types'

export type FeedPostType = 'achievement' | 'announcement' | 'event' | 'poll' | 'post'
export type FeedPostVisibility = 'members' | 'public'
export type FeedModerationStatus = 'deleted' | 'flagged' | 'hidden' | 'visible'
export type FeedSort = 'latest' | 'popular'

export type FeedAuthor = {
  avatarUrl: null | string
  id: string
  name: string
  role: UserRole | 'unknown'
}

export type FeedClub = {
  category: ClubCategory
  id: string
  logoUrl: null | string
  name: string
  slug: string
}

export type FeedPost = {
  author: FeedAuthor
  body: string
  canComment: boolean
  canManage: boolean
  club: FeedClub | null
  commentCount: number
  createdAt: string
  highlighted: boolean
  id: string
  images: string[]
  likeCount: number
  likedByCurrentUser: boolean
  moderationStatus: FeedModerationStatus
  pinned: boolean
  relatedEventId: null | string
  relatedPollId: null | string
  title: null | string
  type: FeedPostType
  updatedAt: string
  visibility: FeedPostVisibility
}

export type FeedComment = {
  author: FeedAuthor
  body: string
  canModerate: boolean
  createdAt: string
  id: string
  moderationStatus: FeedModerationStatus
  updatedAt: string
}

export type FeedTrendingClub = FeedClub & {
  memberCount: number
  postCount: number
}

export type FeedListPayload = {
  clubId?: string
  page: number
  perPage: number
  search: string
  sort: FeedSort
  type?: FeedPostType
}

export type CreateFeedPostPayload = {
  body: string
  clubId: string
  highlighted?: boolean
  images: string[]
  pinned: boolean
  title?: string
  type: Extract<FeedPostType, 'achievement' | 'announcement' | 'post'>
  visibility: FeedPostVisibility
}

export type CreateFeedCommentPayload = {
  body: string
  postId: string
}

export type ModerateFeedPostPayload = {
  highlighted?: boolean
  moderationStatus?: FeedModerationStatus
  pinned?: boolean
  postId: string
}

export type ModerateFeedCommentPayload = {
  commentId: string
  moderationStatus: FeedModerationStatus
  postId: string
}

export type FeedListResponse = PaginatedData<FeedPost>
export type FeedCommentListResponse = PaginatedData<FeedComment>
