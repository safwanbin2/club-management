import type { PaginatedResult } from '../../types/pagination.js'
import type { ResourceRequestStatus, ResourceRequestType } from './resource-request.types.js'

export type ResourceRequestClubDto = {
  category: string
  id: string
  name: string
  slug: string
}

export type ResourceRequestUserDto = {
  email: string
  id: string
  name: string
}

export type ResourceRequestDto = {
  canReview: boolean
  club: ResourceRequestClubDto
  createdAt: string
  details: {
    amount: number | null
    description: string
    requestedDate: string | null
    room: string | null
    title: string
  }
  id: string
  remarks: string | null
  requestedBy: ResourceRequestUserDto
  reviewedAt: string | null
  reviewer: ResourceRequestUserDto | null
  status: ResourceRequestStatus
  type: ResourceRequestType
  updatedAt: string
}

export type ResourceRequestListResult = PaginatedResult<ResourceRequestDto>

export type ResourceRequestAnalytics = {
  amountPending: number
  approved: number
  managedClubs: number
  pending: number
  rejected: number
  roomBookingsPending: number
  total: number
}
