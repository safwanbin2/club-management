import type { UserRole } from '../../constants/roles.js'

export type UserStatus = 'active' | 'disabled'

export type ProfileVisibility = 'private' | 'public' | 'university'

export type NotificationPreferences = {
  emailDigest: boolean
  eventReminders: boolean
  inApp: boolean
  membershipUpdates: boolean
}

export type UserDto = {
  avatarUrl: null | string
  createdAt: string
  department: null | string
  email: string
  id: string
  lastLoginAt: null | string
  name: string
  notificationPreferences: NotificationPreferences
  profileVisibility: ProfileVisibility
  role: UserRole
  status: UserStatus
  studentId: null | string
}
