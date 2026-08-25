import { USER_ROLES, type UserRole } from '@common/constants/roles'

export function shouldShowNavbarRoleLabel(role: UserRole | undefined) {
  return role === USER_ROLES.universityAdmin
}
