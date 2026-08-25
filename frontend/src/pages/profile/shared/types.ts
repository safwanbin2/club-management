import type { UserRole } from '@common/constants/roles'
import type { ClubCategory } from '@pages/clubs/shared/types'
import type { EventRegistrationStatus, EventStatus } from '@pages/events/shared/types'

export type ProfileUser = {
  avatarUrl: null | string
  department: null | string
  email: null | string
  id: string
  name: string
  profileVisibility: 'private' | 'public' | 'university'
  role: UserRole
  status: 'active' | 'disabled'
  studentId: null | string
}

export type ProfileClub = {
  category: ClubCategory
  clubRole: 'advisor' | 'executive' | 'member'
  executivePosition: null | string
  id: string
  logoUrl: null | string
  name: string
  slug: string
}

export type ProfileBadge = {
  badgeType: string
  description: string
  earnedAt: string
  icon: string
  id: string
  title: string
}

export type ProfileActivity = {
  at: string
  description: string
  id: string
  title: string
  type: 'badge' | 'membership' | 'notification'
}

export type ProfileEventClub = {
  id: string
  name: string
  slug: string
}

export type ProfileManagedEvent = {
  club: ProfileEventClub
  endsAt: string
  id: string
  startsAt: string
  status: EventStatus
  title: string
  venue: string
}

export type ProfileJoinedEvent = ProfileManagedEvent & {
  registrationStatus: Extract<EventRegistrationStatus, 'registered' | 'waitlisted'>
}

export type ProfileEventSummary = {
  joinedCount: number
  joinedEvents: ProfileJoinedEvent[]
  managedCount: number
  managedEvents: ProfileManagedEvent[]
}

export type UserProfileDetail = {
  activityTimeline: ProfileActivity[]
  badges: ProfileBadge[]
  clubs: ProfileClub[]
  eventSummary: ProfileEventSummary
  executivePositions: ProfileClub[]
  isOwnProfile: boolean
  user: ProfileUser
}

export type UserProfileDetailPayload = Omit<UserProfileDetail, 'eventSummary'> & {
  eventSummary?: ProfileEventSummary
}

export type UpdateOwnProfilePayload = {
  avatarUrl?: string
  department?: string
  name: string
  studentId?: string
}
