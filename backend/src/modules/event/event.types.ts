import type { Types } from 'mongoose'

export type EventStatus = 'cancelled' | 'completed' | 'draft' | 'published'

export type EventVisibility = 'members' | 'public'

export type EventPaymentMethod = 'bkash_send_money' | 'none'

export type Event = {
  bannerUrl: null | string
  bkashNumber: null | string
  capacity: number
  club: Types.ObjectId
  createdAt: Date
  createdBy: Types.ObjectId
  deletedAt: Date | null
  description: string
  endsAt: Date
  feeAmount: number
  paymentMethod: EventPaymentMethod
  registrationDeadline: Date
  startsAt: Date
  status: EventStatus
  title: string
  updatedAt: Date
  venue: string
  visibility: EventVisibility
}
