import type { Types } from 'mongoose'

import type { ClubCategory } from '../club/club.types.js'
import type { UserRole } from '../../constants/roles.js'
import type { PaginatedResult } from '../../types/pagination.js'
import type { ModerationStatus, PostType, PostVisibility } from './post.types.js'

export type FeedAuthorDto = {
  avatarUrl: null | string
  id: string
  name: string
  role: UserRole | 'unknown'
}

export type FeedClubDto = {
  category: ClubCategory
  id: string
  logoUrl: null | string
  name: string
  slug: string
}

export type FeedPostDto = {
  author: FeedAuthorDto
  body: string
  canComment: boolean
  canManage: boolean
  club: FeedClubDto | null
  commentCount: number
  createdAt: string
  highlighted: boolean
  id: string
  images: string[]
  likeCount: number
  likedByCurrentUser: boolean
  moderationStatus: ModerationStatus
  pinned: boolean
  relatedEventId: null | string
  relatedPollId: null | string
  title: null | string
  type: PostType
  updatedAt: string
  visibility: PostVisibility
}

export type FeedCommentDto = {
  author: FeedAuthorDto
  body: string
  canModerate: boolean
  createdAt: string
  id: string
  moderationStatus: ModerationStatus
  updatedAt: string
}

export type FeedTrendingClubDto = FeedClubDto & {
  memberCount: number
  postCount: number
}

export type FeedManageableClubDto = FeedClubDto

export type FeedPostListResult = PaginatedResult<FeedPostDto>
export type FeedCommentListResult = PaginatedResult<FeedCommentDto>

export type PostModerationUpdate = {
  deletedAt?: Date | null
  highlighted?: boolean
  moderationStatus?: ModerationStatus
  pinned?: boolean
}

export type PopulatedFeedPost = {
  _id: Types.ObjectId
}
