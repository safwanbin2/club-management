import type { PaginatedData } from '@common/types/api'

export type ClubCategory =
  | 'academic'
  | 'arts'
  | 'community_service'
  | 'culture'
  | 'entrepreneurship'
  | 'sports'
  | 'technology'

export type ClubStatus = 'active' | 'disabled' | 'pending'
export type ClubMembershipStatus = 'active' | 'left' | 'pending' | 'rejected'
export type ClubRole = 'advisor' | 'executive' | 'member'

export type ClubMembership = {
  approvedAt: null | string
  clubId: string
  clubRole: ClubRole
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

export type ClubMemberUser = {
  avatarUrl: null | string
  department: null | string
  email: string
  id: string
  name: string
  studentId: null | string
}

export type ClubMembershipRequest = ClubMembership & {
  user: ClubMemberUser
}

export type ClubMember = ClubMembership & {
  user: ClubMemberUser
}

export type ClubExecutive = ClubMembership & {
  user: ClubMemberUser
}

export type ClubEventPreview = {
  endsAt: string
  id: string
  registrationDeadline: string
  startsAt: string
  status: string
  title: string
  venue: string
}

export type ClubListItem = {
  canManage: boolean
  category: ClubCategory
  contactEmail: null | string
  coverImageUrl: null | string
  currentUserMembership: ClubMembership | null
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

export type ClubDetail = ClubListItem & {
  contactPhone: null | string
  executiveCommittee: ClubExecutive[]
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
  upcomingEvents: ClubEventPreview[]
}

export type ClubListPayload = {
  category?: ClubCategory
  membershipStatus?: ClubMembershipStatus | 'none'
  page: number
  perPage: number
  search: string
  sortBy: 'createdAt' | 'name' | 'updatedAt'
  sortOrder: 'asc' | 'desc'
  status?: ClubStatus
}

export type ClubWritePayload = {
  category: ClubCategory
  contactEmail?: string
  contactPhone?: string
  coverImageUrl?: string
  description: string
  facultyAdvisor: {
    department?: string
    email?: string
    name: string
  }
  gallery: string[]
  logoUrl?: string
  name: string
  socialLinks: {
    facebook?: string
    instagram?: string
    linkedin?: string
    website?: string
  }
  status?: ClubStatus
}

export type CreateClubPayload = ClubWritePayload

export type UpdateClubPayload = Partial<ClubWritePayload> & {
  clubId: string
}

export type MembershipRequestsPayload = {
  page: number
  perPage: number
  status: ClubMembershipStatus
}

export type ClubMembersPayload = {
  page: number
  perPage: number
  role?: ClubRole
  search: string
}

export type ReviewMembershipPayload = {
  action: 'approve' | 'reject'
  clubId: string
  membershipId: string
  remarks?: string
}

export type UpdateMembershipRolePayload = {
  clubId: string
  clubRole: ClubRole
  executivePosition?: string
  membershipId: string
}

export type ClubListResponse = PaginatedData<ClubListItem>
export type ClubMembersResponse = PaginatedData<ClubMember>
export type ClubMembershipRequestsResponse = PaginatedData<ClubMembershipRequest>
