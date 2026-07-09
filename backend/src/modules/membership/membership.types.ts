import type { Types } from 'mongoose'

export type MembershipClubRole = 'advisor' | 'executive' | 'member'

export type MembershipFeeStatus = 'not_required' | 'paid' | 'unpaid' | 'waived'

export type MembershipStatus = 'active' | 'left' | 'pending' | 'rejected'

export type Membership = {
  approvedAt: Date | null
  club: Types.ObjectId
  clubRole: MembershipClubRole
  createdAt: Date
  executivePosition: null | string
  feeStatus: MembershipFeeStatus
  leftAt: Date | null
  rejectedAt: Date | null
  remarks: null | string
  requestedAt: Date
  reviewedBy: null | Types.ObjectId
  status: MembershipStatus
  updatedAt: Date
  user: Types.ObjectId
}
