import type { UserRole } from '../../constants/roles.js'
import type { UserDto } from '../user/user.types.js'

export type AuthContext = {
  ipAddress?: string
  userAgent?: string
}

export type AuthResult = {
  accessToken: string
  accessTokenExpiresAt: string
  refreshToken: string
  refreshTokenExpiresAt: Date
  user: UserDto
}

export type AccessTokenPayload = {
  email: string
  exp: number
  iat: number
  name: string
  role: UserRole
  sub: string
}

export type RegisterInput = {
  department?: string
  email: string
  name: string
  password: string
  studentId?: string
}

export type LoginInput = {
  email: string
  password: string
}

export type ForgotPasswordInput = {
  email: string
}

export type ResetPasswordInput = {
  password: string
  token: string
}

export type ForgotPasswordResult = {
  delivery: 'email' | 'local-demo'
  resetToken?: string
}
