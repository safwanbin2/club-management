import type { UserRole } from '@common/constants/roles'
import type { ClubCategory } from '@pages/clubs/shared/types'

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

export type UserProfileDetail = {
  activityTimeline: ProfileActivity[]
  badges: ProfileBadge[]
  clubs: ProfileClub[]
  executivePositions: ProfileClub[]
  isOwnProfile: boolean
  user: ProfileUser
}

export type UpdateOwnProfilePayload = {
  avatarUrl?: string
  department?: string
  name: string
  studentId?: string
}
