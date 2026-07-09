import type { Types } from 'mongoose'

export type ResourceRequestStatus = 'approved' | 'pending' | 'rejected'

export type ResourceRequestType = 'funding' | 'room_booking'

export type ResourceRequest = {
  club: Types.ObjectId
  createdAt: Date
  details: {
    amount?: number
    description: string
    requestedDate?: Date
    room?: string
    title: string
  }
  remarks: null | string
  requestedBy: Types.ObjectId
  reviewedAt: Date | null
  reviewer: null | Types.ObjectId
  status: ResourceRequestStatus
  type: ResourceRequestType
  updatedAt: Date
}
