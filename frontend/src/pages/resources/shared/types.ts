import type { PaginatedData } from '@common/types/api'
import type { ClubCategory } from '@pages/clubs/shared/types'

export type ResourceRequestStatus = 'approved' | 'pending' | 'rejected'
export type ResourceRequestType = 'funding' | 'room_booking'

export type ResourceRequestClub = {
  category: ClubCategory
  id: string
  name: string
  slug: string
}

export type ResourceRequestUser = {
  email: string
  id: string
  name: string
}

export type ResourceRequestItem = {
  canReview: boolean
  club: ResourceRequestClub
  createdAt: string
  details: {
    amount: null | number
    description: string
    requestedDate: null | string
    room: null | string
    title: string
  }
  id: string
  remarks: null | string
  requestedBy: ResourceRequestUser
  reviewedAt: null | string
  reviewer: null | ResourceRequestUser
  status: ResourceRequestStatus
  type: ResourceRequestType
  updatedAt: string
}

export type ResourceRequestListPayload = {
  clubId?: string
  page: number
  perPage: number
  search: string
  status: ResourceRequestStatus | 'all'
  type: ResourceRequestType | 'all'
}

export type CreateResourceRequestPayload = {
  clubId: string
  details: {
    amount?: number
    description: string
    requestedDate?: string
    room?: string
    title: string
  }
  type: ResourceRequestType
}

export type ReviewResourceRequestPayload = {
  remarks: string
  requestId: string
  status: Extract<ResourceRequestStatus, 'approved' | 'rejected'>
}

export type ResourceRequestAnalytics = {
  amountPending: number
  approved: number
  managedClubs: number
  pending: number
  rejected: number
  roomBookingsPending: number
  total: number
}

export type ResourceRequestListResponse = PaginatedData<ResourceRequestItem>
