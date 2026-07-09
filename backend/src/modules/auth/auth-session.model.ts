import type { Model } from 'mongoose'
import mongoose from 'mongoose'
import type { Types } from 'mongoose'

export type AuthSession = {
  createdAt: Date
  expiresAt: Date
  ipAddress: null | string
  refreshTokenHash: string
  revokedAt: Date | null
  updatedAt: Date
  user: Types.ObjectId
  userAgent: null | string
}

const authSessionSchema = new mongoose.Schema<AuthSession>(
  {
    expiresAt: {
      required: true,
      type: Date
    },
    ipAddress: {
      default: null,
      type: String
    },
    refreshTokenHash: {
      required: true,
      select: false,
      type: String,
      unique: true
    },
    revokedAt: {
      default: null,
      type: Date
    },
    user: {
      ref: 'User',
      required: true,
      type: mongoose.Schema.Types.ObjectId
    },
    userAgent: {
      default: null,
      type: String
    }
  },
  {
    collection: 'auth_sessions',
    timestamps: true
  }
)

authSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
authSessionSchema.index({ user: 1, revokedAt: 1 })

export const AuthSessionModel =
  (mongoose.models.AuthSession as Model<AuthSession> | undefined) ??
  mongoose.model<AuthSession>('AuthSession', authSessionSchema)
