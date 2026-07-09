import type { Types } from 'mongoose'

export type BadgeType =
  | 'community_leader'
  | 'event_explorer'
  | 'executive_member'
  | 'first_club_joined'
  | 'perfect_attendance'
  | 'volunteer'

export type Badge = {
  badgeType: BadgeType
  createdAt: Date
  description: string
  earnedAt: Date
  icon: string
  metadata: Record<string, unknown>
  sourceActivityId: null | string
  title: string
  updatedAt: Date
  user: Types.ObjectId
}
