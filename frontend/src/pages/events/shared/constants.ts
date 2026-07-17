import type { EventRegistrationStatus, EventScope, EventStatus, EventTimeframe } from './types'

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  cancelled: 'Cancelled',
  completed: 'Completed',
  draft: 'Draft',
  published: 'Published'
}

export const EVENT_REGISTRATION_STATUS_LABELS: Record<EventRegistrationStatus, string> = {
  cancelled: 'Cancelled',
  registered: 'Registered',
  waitlisted: 'Waitlisted'
}

export const EVENT_SCOPE_OPTIONS: Array<{ label: string; value: EventScope }> = [
  { label: 'All Events', value: 'all' },
  { label: 'My Clubs', value: 'myClubs' },
  { label: 'Registered', value: 'registered' },
  { label: 'Managed', value: 'managed' }
]

export const EVENT_TIMEFRAME_OPTIONS: Array<{ label: string; value: EventTimeframe }> = [
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Past', value: 'past' },
  { label: 'All', value: 'all' }
]
