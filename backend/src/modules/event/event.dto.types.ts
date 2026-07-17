import type { ClubCategory } from '../club/club.types.js'
import type { PaginatedResult } from '../../types/pagination.js'
import type { EventRegistrationStatus } from './event-registration.types.js'
import type { EventStatus, EventVisibility } from './event.types.js'

export type EventClubDto = {
  category: ClubCategory
  id: string
  logoUrl: null | string
  name: string
  slug: string
}

export type EventRegistrationDto = {
  cancellationReason: null | string
  cancelledAt: null | string
  eventId: string
  id: string
  promotedAt: null | string
  registeredAt: string
  status: EventRegistrationStatus
  userId: string
  waitlistPosition: null | number
}

export type EventUserDto = {
  avatarUrl: null | string
  department: null | string
  email: string
  id: string
  name: string
  studentId: null | string
}

export type EventRegistrationListItemDto = EventRegistrationDto & {
  user: EventUserDto
}

export type EventDto = {
  availableSpots: number
  bannerUrl: null | string
  canManage: boolean
  capacity: number
  club: EventClubDto
  createdAt: string
  currentUserRegistration: EventRegistrationDto | null
  description: string
  endsAt: string
  id: string
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

export type EventListResult = PaginatedResult<EventDto>
export type EventRegistrationListResult = PaginatedResult<EventRegistrationListItemDto>
