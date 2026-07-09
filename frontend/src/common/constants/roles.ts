export const USER_ROLES = {
  clubExecutive: 'club_executive',
  student: 'student',
  universityAdmin: 'university_admin'
} as const

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]

export const ROLE_LABELS: Record<UserRole, string> = {
  [USER_ROLES.clubExecutive]: 'Club Executive',
  [USER_ROLES.student]: 'Student',
  [USER_ROLES.universityAdmin]: 'University Administration'
}
