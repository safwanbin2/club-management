import type { UserRole } from '../../constants/roles.js'
import type { BadgeType } from '../badge/badge.types.js'
import type { ClubCategory } from '../club/club.types.js'
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
  type: 'attendance' | 'badge' | 'membership' | 'notification'
}

export type UserProfileDto = {
  activityTimeline: ProfileActivityDto[]
  attendance: {
    attended: number
    percentage: number
    registered: number
  }
  badges: ProfileBadgeDto[]
  clubs: ProfileClubDto[]
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
  attendanceCount: number
  communityMemberships: number
  executiveMemberships: number
  registeredEvents: number
}
