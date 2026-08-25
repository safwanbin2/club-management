import type { UserRole } from '../../constants/roles.js'
import type { BadgeType } from '../badge/badge.types.js'
import type { ClubCategory } from '../club/club.types.js'
import type { EventRegistrationStatus } from '../event/event-registration.types.js'
import type { EventStatus } from '../event/event.types.js'
import type { NotificationPreferences, ProfileVisibility, UserStatus } from './user.types.js'

export type ProfileUserDto = {
  avatarUrl: null | string
  department: null | string
  email: null | string
  id: string
  name: string
  profileVisibility: ProfileVisibility
  role: UserRole
  status: UserStatus
  studentId: null | string
}

export type ProfileClubDto = {
  category: ClubCategory
  clubRole: 'advisor' | 'executive' | 'member'
  executivePosition: null | string
  id: string
  logoUrl: null | string
  name: string
  slug: string
}

export type ProfileBadgeDto = {
  badgeType: BadgeType
  description: string
  earnedAt: string
  icon: string
  id: string
  title: string
}

export type ProfileActivityDto = {
  at: string
  description: string
  id: string
  title: string
  type: 'badge' | 'membership' | 'notification'
}

export type ProfileEventClubDto = {
  id: string
  name: string
  slug: string
}

export type ProfileManagedEventDto = {
  club: ProfileEventClubDto
  endsAt: string
  id: string
  startsAt: string
  status: EventStatus
  title: string
  venue: string
}

export type ProfileJoinedEventStatus = Extract<EventRegistrationStatus, 'registered' | 'waitlisted'>

export type ProfileJoinedEventDto = ProfileManagedEventDto & {
  registrationStatus: ProfileJoinedEventStatus
}

export type ProfileEventSummaryDto = {
  joinedCount: number
  joinedEvents: ProfileJoinedEventDto[]
  managedCount: number
  managedEvents: ProfileManagedEventDto[]
}

export type UserProfileDto = {
  activityTimeline: ProfileActivityDto[]
  badges: ProfileBadgeDto[]
  clubs: ProfileClubDto[]
  eventSummary: ProfileEventSummaryDto
  executivePositions: ProfileClubDto[]
  isOwnProfile: boolean
  user: ProfileUserDto
}

export type AccountSettingsDto = {
  email: string
  lastLoginAt: null | string
  notificationPreferences: NotificationPreferences
  profileVisibility: ProfileVisibility
}

export type BadgePlan = {
  badgeType: BadgeType
  description: string
  icon: string
  sourceActivityId: string
  title: string
}

export type BadgeRuleStats = {
  activeMemberships: number
  communityMemberships: number
  executiveMemberships: number
  registeredEvents: number
}
