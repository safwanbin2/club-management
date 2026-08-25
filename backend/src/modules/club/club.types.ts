import type { Types } from 'mongoose'

import type { PaginatedResult } from '../../types/pagination.js'

export type ClubCategory =
  | 'academic'
  | 'arts'
  | 'community_service'
  | 'culture'
  | 'entrepreneurship'
  | 'sports'
  | 'technology'

export type ClubStatus = 'active' | 'disabled' | 'pending'

export type Club = {
  category: ClubCategory
  contactEmail: null | string
  contactPhone: null | string
  coverImageUrl: null | string
  createdAt: Date
  createdBy: null | Types.ObjectId
  deletedAt: Date | null
  description: string
  disabledAt: Date | null
  facultyAdvisor: {
    department?: string
    email?: string
    name: string
  }
  gallery: string[]
  logoUrl: null | string
  name: string
  slug: string
  socialLinks: {
    facebook?: string
    instagram?: string
    linkedin?: string
    website?: string
  }
  status: ClubStatus
  updatedAt: Date
}

export type ClubMembershipStatus = 'active' | 'left' | 'pending' | 'rejected'

export type ClubMemberUserDto = {
  avatarUrl: null | string
  department: null | string
  email: string
  id: string
  name: string
  studentId: null | string
}

export type ClubMembershipDto = {
  approvedAt: null | string
  clubId: string
  clubRole: 'advisor' | 'executive' | 'member'
  executivePosition: null | string
  feeStatus: 'not_required' | 'paid' | 'unpaid' | 'waived'
  id: string
  leftAt: null | string
  rejectedAt: null | string
  remarks: null | string
  requestedAt: string
  reviewedBy: null | string
  status: ClubMembershipStatus
  userId: string
}

export type ClubExecutiveDto = ClubMembershipDto & {
  user: ClubMemberUserDto
}

export type ClubMembershipRequestDto = ClubMembershipDto & {
  user: ClubMemberUserDto
}

export type ClubMemberDto = ClubMembershipDto & {
  user: ClubMemberUserDto
}

export type ClubEventPreviewDto = {
  endsAt: string
  id: string
  registrationDeadline: string
  startsAt: string
  status: string
  title: string
  venue: string
}

export type ClubListItemDto = {
  canManage: boolean
  category: ClubCategory
  contactEmail: null | string
  coverImageUrl: null | string
  currentUserMembership: ClubMembershipDto | null
  description: string
  facultyAdvisor: {
    department?: string
    email?: string
    name: string
  }
  id: string
  logoUrl: null | string
  memberCount: number
  name: string
  pendingRequestCount: number
  slug: string
  status: ClubStatus
}

export type ClubDetailDto = ClubListItemDto & {
  contactPhone: null | string
  executiveCommittee: ClubExecutiveDto[]
  gallery: string[]
  membershipSummary: {
    active: number
    pending: number
  }
  socialLinks: {
    facebook?: string
    instagram?: string
    linkedin?: string
    website?: string
  }
  upcomingEvents: ClubEventPreviewDto[]
}

export type ClubListResult = PaginatedResult<ClubListItemDto>
export type ClubMemberListResult = PaginatedResult<ClubMemberDto>
export type ClubMembershipRequestListResult = PaginatedResult<ClubMembershipRequestDto>
