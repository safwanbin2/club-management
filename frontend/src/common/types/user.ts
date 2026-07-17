import type { UserRole } from '@common/constants/roles'

export type UserProfile = {
  avatarUrl: null | string
  createdAt: string
  department: null | string
  email: string
  id: string
  lastLoginAt: null | string
  name: string
  notificationPreferences: {
    emailDigest: boolean
    eventReminders: boolean
    inApp: boolean
    membershipUpdates: boolean
  }
  profileVisibility: 'private' | 'public' | 'university'
  role: UserRole
  status: 'active' | 'disabled'
  studentId: null | string
}

export type AuthSession = {
  accessToken: string
  accessTokenExpiresAt: string
  user: UserProfile
}
