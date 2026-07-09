import type { AuthSession } from '@common/types/user'

export type AuthResponse = {
  accessToken: string
  accessTokenExpiresAt: string
  user: AuthSession['user']
}

export type LoginPayload = {
  email: string
  password: string
}

export type RegisterPayload = {
  department?: string
  email: string
  name: string
  password: string
  studentId?: string
}

export type ForgotPasswordPayload = {
  email: string
}

export type ForgotPasswordResult = {
  delivery: 'email' | 'local-demo'
  resetToken?: string
}

export type ResetPasswordPayload = {
  password: string
  token: string
}
