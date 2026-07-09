import type { UserRole } from '../../constants/roles.js'

export type UserStatus = 'active' | 'disabled'

export type ProfileVisibility = 'private' | 'public' | 'university'

export type UserDto = {
  avatarUrl: null | string
  createdAt: string
  department: null | string
  email: string
  id: string
  lastLoginAt: null | string
  name: string
  profileVisibility: ProfileVisibility
  role: UserRole
  status: UserStatus
  studentId: null | string
}
