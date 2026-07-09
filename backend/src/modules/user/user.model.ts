import type { HydratedDocument, Model } from 'mongoose'
import mongoose from 'mongoose'
import type { Types } from 'mongoose'

import { USER_ROLES, type UserRole } from '../../constants/roles.js'
import type { ProfileVisibility, UserDto, UserStatus } from './user.types.js'

export type User = {
  avatarUrl: null | string
  createdAt: Date
  deletedAt: Date | null
  department: null | string
  email: string
  lastLoginAt: Date | null
  name: string
  passwordHash: string
  passwordResetExpiresAt: Date | null
  passwordResetTokenHash: null | string
  profileVisibility: ProfileVisibility
  role: UserRole
  status: UserStatus
  studentId: null | string
  updatedAt: Date
}

export type UserDocument = HydratedDocument<User> & {
  _id: Types.ObjectId
}

const userSchema = new mongoose.Schema<User>(
  {
    avatarUrl: {
      default: null,
      trim: true,
      type: String
    },
    deletedAt: {
      default: null,
      type: Date
    },
    department: {
      default: null,
      trim: true,
      type: String
    },
    email: {
      lowercase: true,
      required: true,
      trim: true,
      type: String,
      unique: true
    },
    lastLoginAt: {
      default: null,
      type: Date
    },
    name: {
      required: true,
      trim: true,
      type: String
    },
    passwordHash: {
      required: true,
      select: false,
      type: String
    },
    passwordResetExpiresAt: {
      default: null,
      select: false,
      type: Date
    },
    passwordResetTokenHash: {
      default: null,
      select: false,
      type: String
    },
    profileVisibility: {
      default: 'university',
      enum: ['private', 'public', 'university'],
      type: String
    },
    role: {
      default: USER_ROLES.student,
      enum: Object.values(USER_ROLES),
      type: String
    },
    status: {
      default: 'active',
      enum: ['active', 'disabled'],
      type: String
    },
    studentId: {
      default: null,
      trim: true,
      type: String
    }
  },
  {
    collection: 'users',
    timestamps: true
  }
)

userSchema.index({ role: 1, status: 1 })
userSchema.index({ deletedAt: 1, status: 1 })

export const UserModel =
  (mongoose.models.User as Model<User> | undefined) ?? mongoose.model<User>('User', userSchema)

export function toUserDto(user: UserDocument): UserDto {
  return {
    avatarUrl: user.avatarUrl ?? null,
    createdAt: user.createdAt.toISOString(),
    department: user.department ?? null,
    email: user.email,
    id: user._id.toString(),
    lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
    name: user.name,
    profileVisibility: user.profileVisibility,
    role: user.role,
    status: user.status,
    studentId: user.studentId ?? null
  }
}
