import type { FeedPostType } from './types'

export const FEED_POST_TYPE_LABELS: Record<FeedPostType, string> = {
  achievement: 'Achievement',
  announcement: 'Announcement',
  event: 'Event',
  poll: 'Poll',
  post: 'Post'
}

export const FEED_POST_TYPE_TONES: Record<FeedPostType, string> = {
  achievement: 'bg-purple-50 text-purple-700 border-purple-200',
  announcement: 'bg-primary-soft text-primary border-primary/20',
  event: 'bg-blue-50 text-blue-700 border-blue-200',
  poll: 'bg-amber-50 text-amber-700 border-amber-200',
  post: 'bg-slate-50 text-slate-700 border-slate-200'
}

export const FEED_TYPE_OPTIONS: Array<{ label: string; value: FeedPostType | 'all' }> = [
  { label: 'All Posts', value: 'all' },
  { label: 'Announcements', value: 'announcement' },
  { label: 'Events', value: 'event' },
  { label: 'Polls', value: 'poll' },
  { label: 'Achievements', value: 'achievement' },
  { label: 'Club Posts', value: 'post' }
]
