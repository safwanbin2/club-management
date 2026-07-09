import type { Types } from 'mongoose'

export type NotificationType =
  | 'announcement_published'
  | 'badge_earned'
  | 'event_reminder'
  | 'funding_approved'
  | 'membership_approved'
  | 'new_event'
  | 'poll_created'
  | 'poll_ending'
  | 'registration_confirmed'
  | 'waitlist_promoted'

export type Notification = {
  body: string
  createdAt: Date
  link: null | string
  metadata: Record<string, unknown>
  readAt: Date | null
  recipient: Types.ObjectId
  title: string
  type: NotificationType
  updatedAt: Date
}
