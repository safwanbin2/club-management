import type { PaginatedData } from '@common/types/api'
import type { ClubCategory } from '@pages/clubs/shared/types'

export type EventStatus = 'cancelled' | 'completed' | 'draft' | 'published'
export type EventVisibility = 'members' | 'public'
export type EventPaymentMethod = 'bkash_send_money' | 'none'
export type EventRegistrationPaymentMethod = 'bkash_send_money' | null
export type EventRegistrationStatus =
  'cancelled' | 'declined' | 'pending' | 'registered' | 'waitlisted'
export type EventScope = 'all' | 'managed' | 'myClubs' | 'registered'
export type EventSort = 'latest' | 'upcoming'
export type EventTimeframe = 'all' | 'past' | 'upcoming'

export type EventClub = {
  category: ClubCategory
  id: string
  logoUrl: null | string
  name: string
  slug: string
}

export type EventRegistration = {
  cancellationReason: null | string
  cancelledAt: null | string
  eventId: string
  id: string
  paymentMethod: EventRegistrationPaymentMethod
  paymentReviewedAt: null | string
  paymentReviewedBy: null | string
  paymentReviewRemarks: null | string
  paymentSubmittedAt: null | string
  paymentTransactionId: null | string
  promotedAt: null | string
  registeredAt: string
  status: EventRegistrationStatus
  userId: string
  waitlistPosition: null | number
}

export type EventUser = {
  avatarUrl: null | string
  department: null | string
  email: string
  id: string
  name: string
  studentId: null | string
}

export type EventRegistrationListItem = EventRegistration & {
  user: EventUser
}

export type EventItem = {
  availableSpots: number
  bannerUrl: null | string
  bkashNumber: null | string
  canManage: boolean
  capacity: number
  club: EventClub
  createdAt: string
  currentUserRegistration: EventRegistration | null
  description: string
  endsAt: string
  feeAmount: number
  id: string
  paymentMethod: EventPaymentMethod
  registrationDeadline: string
  registeredCount: number
  startsAt: string
  status: EventStatus
  title: string
  updatedAt: string
  venue: string
  visibility: EventVisibility
  waitlistedCount: number
}

export type EventListPayload = {
  page: number
  perPage: number
  scope: EventScope
  search: string
  sort: EventSort
  status?: EventStatus
  timeframe: EventTimeframe
}

export type CreateEventPayload = {
  bannerUrl?: string
  bkashNumber?: string
  capacity: number
  clubId: string
  description: string
  endsAt: string
  feeAmount: number
  registrationDeadline: string
  startsAt: string
  status: Extract<EventStatus, 'draft' | 'published'>
  title: string
  venue: string
  visibility: EventVisibility
}

export type UpdateEventPayload = Partial<Omit<CreateEventPayload, 'clubId' | 'status'>> & {
  eventId: string
  status?: EventStatus
}

export type CancelEventRegistrationPayload = {
  eventId: string
  reason?: string
}

export type RegisterEventPayload = {
  eventId: string
  paymentTransactionId?: string
}

export type EventRegistrationsPayload = {
  eventId: string
  page: number
  perPage: number
  status: EventRegistrationStatus
}

export type ReviewEventRegistrationPayload = {
  action: 'approve' | 'decline'
  eventId: string
  registrationId: string
  remarks?: string
}

export type EventListResponse = PaginatedData<EventItem>
export type EventRegistrationListResponse = PaginatedData<EventRegistrationListItem>
