export const USER_ROLES = {
  clubExecutive: 'club_executive',
  student: 'student',
  universityAdmin: 'university_admin'
} as const

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]
