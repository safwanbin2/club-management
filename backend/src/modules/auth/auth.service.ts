import { USER_ROLES } from '../../constants/roles.js'
import { ApplicationError } from '../../utils/application-error.js'
import { UserModel, toUserDto, type UserDocument } from '../user/user.model.js'
import { AuthSessionModel } from './auth-session.model.js'
import {
  type AuthContext,
  type AuthResult,
  type ForgotPasswordInput,
  type ForgotPasswordResult,
  type LoginInput,
  type RegisterInput,
  type ResetPasswordInput
} from './auth.types.js'
import { hashPassword, verifyPassword } from './password.service.js'
import {
  createOpaqueToken,
  getRefreshExpiry,
  getResetExpiry,
  hashToken,
  signAccessToken
} from './token.service.js'

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function buildAuthResult(
  user: UserDocument,
  refreshToken: string,
  refreshTokenExpiresAt: Date
): AuthResult {
  const userDto = toUserDto(user)
  const accessToken = signAccessToken(userDto)

  return {
    accessToken: accessToken.token,
    accessTokenExpiresAt: accessToken.expiresAt.toISOString(),
    refreshToken,
    refreshTokenExpiresAt,
    user: userDto
  }
}

async function createSession(user: UserDocument, context: AuthContext) {
  const refreshToken = createOpaqueToken()
  const refreshTokenExpiresAt = getRefreshExpiry()

  await AuthSessionModel.create({
    expiresAt: refreshTokenExpiresAt,
    ipAddress: context.ipAddress ?? null,
    refreshTokenHash: hashToken(refreshToken),
    user: user._id,
    userAgent: context.userAgent ?? null
  })

  return {
    refreshToken,
    refreshTokenExpiresAt
  }
}

export async function register(input: RegisterInput, context: AuthContext): Promise<AuthResult> {
  const email = normalizeEmail(input.email)
  const existingUser = await UserModel.exists({ email })

  if (existingUser) {
    throw new ApplicationError(
      'An account with this email already exists.',
      409,
      'AUTH_EMAIL_EXISTS'
    )
  }

  const user = (await UserModel.create({
    department: input.department?.trim() || null,
    email,
    name: input.name.trim(),
    passwordHash: await hashPassword(input.password),
    role: USER_ROLES.student,
    studentId: input.studentId?.trim() || null
  })) as UserDocument
  const session = await createSession(user, context)

  return buildAuthResult(user, session.refreshToken, session.refreshTokenExpiresAt)
}

export async function login(input: LoginInput, context: AuthContext): Promise<AuthResult> {
  const user = (await UserModel.findOne({
    deletedAt: null,
    email: normalizeEmail(input.email),
    status: 'active'
  }).select('+passwordHash')) as null | UserDocument

  if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
    throw new ApplicationError('Invalid email or password.', 401, 'AUTH_INVALID_CREDENTIALS')
  }

  user.lastLoginAt = new Date()
  await user.save()

  const session = await createSession(user, context)

  return buildAuthResult(user, session.refreshToken, session.refreshTokenExpiresAt)
}

export async function refresh(refreshToken: string, context: AuthContext): Promise<AuthResult> {
  const now = new Date()
  const session = await AuthSessionModel.findOne({
    expiresAt: { $gt: now },
    refreshTokenHash: hashToken(refreshToken),
    revokedAt: null
  }).select('+refreshTokenHash')

  if (!session) {
    throw new ApplicationError(
      'Session expired. Please sign in again.',
      401,
      'AUTH_SESSION_EXPIRED'
    )
  }

  const user = (await UserModel.findOne({
    _id: session.user,
    deletedAt: null,
    status: 'active'
  })) as null | UserDocument

  if (!user) {
    session.revokedAt = now
    await session.save()
    throw new ApplicationError(
      'Session expired. Please sign in again.',
      401,
      'AUTH_SESSION_EXPIRED'
    )
  }

  const nextRefreshToken = createOpaqueToken()
  const nextRefreshTokenExpiresAt = getRefreshExpiry()

  session.refreshTokenHash = hashToken(nextRefreshToken)
  session.expiresAt = nextRefreshTokenExpiresAt
  session.userAgent = context.userAgent ?? session.userAgent
  session.ipAddress = context.ipAddress ?? session.ipAddress
  await session.save()

  return buildAuthResult(user, nextRefreshToken, nextRefreshTokenExpiresAt)
}

export async function logout(refreshToken?: string) {
  if (!refreshToken) {
    return
  }

  await AuthSessionModel.updateOne(
    {
      refreshTokenHash: hashToken(refreshToken),
      revokedAt: null
    },
    {
      $set: {
        revokedAt: new Date()
      }
    }
  )
}

export async function forgotPassword(input: ForgotPasswordInput): Promise<ForgotPasswordResult> {
  const user = (await UserModel.findOne({
    deletedAt: null,
    email: normalizeEmail(input.email),
    status: 'active'
  }).select('+passwordResetExpiresAt +passwordResetTokenHash')) as null | UserDocument

  if (!user) {
    return {
      delivery: 'email'
    }
  }

  const resetToken = createOpaqueToken()
  user.passwordResetTokenHash = hashToken(resetToken)
  user.passwordResetExpiresAt = getResetExpiry()
  await user.save()

  return {
    delivery: process.env.NODE_ENV === 'production' ? 'email' : 'local-demo',
    resetToken: process.env.NODE_ENV === 'production' ? undefined : resetToken
  }
}

export async function resetPassword(input: ResetPasswordInput) {
  const user = (await UserModel.findOne({
    deletedAt: null,
    passwordResetExpiresAt: { $gt: new Date() },
    passwordResetTokenHash: hashToken(input.token),
    status: 'active'
  }).select('+passwordResetExpiresAt +passwordResetTokenHash +passwordHash')) as null | UserDocument

  if (!user) {
    throw new ApplicationError(
      'This password reset link is invalid or expired.',
      400,
      'AUTH_RESET_INVALID'
    )
  }

  user.passwordHash = await hashPassword(input.password)
  user.passwordResetTokenHash = null
  user.passwordResetExpiresAt = null
  await user.save()

  await AuthSessionModel.updateMany(
    {
      user: user._id,
      revokedAt: null
    },
    {
      $set: {
        revokedAt: new Date()
      }
    }
  )
}
