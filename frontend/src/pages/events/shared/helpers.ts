import type {
  EventItem,
  EventListPayload,
  EventRegistrationStatus,
  EventScope,
  EventSort,
  EventStatus,
  EventTimeframe
} from './types'
import { EVENT_REGISTRATION_STATUS_LABELS, EVENT_STATUS_LABELS } from './constants'

const eventScopes: EventScope[] = ['all', 'managed', 'myClubs', 'registered']
const eventSorts: EventSort[] = ['latest', 'upcoming']
const eventStatuses: EventStatus[] = ['cancelled', 'completed', 'draft', 'published']
const eventTimeframes: EventTimeframe[] = ['all', 'past', 'upcoming']
const registrationStatuses: EventRegistrationStatus[] = [
  'cancelled',
  'declined',
  'pending',
  'registered',
  'waitlisted'
]

export function parseEventScope(value: null | string): EventScope {
  return eventScopes.includes(value as EventScope) ? (value as EventScope) : 'all'
}

export function parseEventSort(value: null | string): EventSort {
  return eventSorts.includes(value as EventSort) ? (value as EventSort) : 'upcoming'
}

export function parseEventStatus(value: null | string) {
  return eventStatuses.includes(value as EventStatus) ? (value as EventStatus) : undefined
}

export function parseEventTimeframe(value: null | string): EventTimeframe {
  return eventTimeframes.includes(value as EventTimeframe) ? (value as EventTimeframe) : 'upcoming'
}

export function parseRegistrationStatus(value: string): EventRegistrationStatus {
  return registrationStatuses.includes(value as EventRegistrationStatus)
    ? (value as EventRegistrationStatus)
    : 'pending'
}

export function parsePage(value: null | string, fallback = 1) {
  const page = Number(value)
  return Number.isInteger(page) && page > 0 ? page : fallback
}

export function parsePerPage(value: null | string, fallback = 8) {
  const perPage = Number(value)
  return Number.isInteger(perPage) && perPage > 0 ? Math.min(perPage, 24) : fallback
}

export function buildSearchParams(payload: Record<string, null | number | string | undefined>) {
  const params = new URLSearchParams()

  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value))
    }
  })

  return params.toString()
}

export function buildEventSearchParams(payload: EventListPayload) {
  return buildSearchParams(payload)
}

export function formatEventStatus(status: EventStatus) {
  return EVENT_STATUS_LABELS[status]
}

export function formatRegistrationStatus(status: EventRegistrationStatus) {
  return EVENT_REGISTRATION_STATUS_LABELS[status]
}

export function formatEventFee(amount: number) {
  if (amount <= 0) {
    return 'Free'
  }

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
    style: 'currency',
    currency: 'BDT'
  }).format(amount)
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value))
}

export function formatTimeRange(startsAt: string, endsAt: string) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  })

  return `${formatter.format(new Date(startsAt))} - ${formatter.format(new Date(endsAt))}`
}

export function getEventDateBadge(value: string) {
  const date = new Date(value)

  return {
    day: new Intl.DateTimeFormat('en-US', { day: '2-digit' }).format(date),
    month: new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date).toUpperCase()
  }
}

export function toDateTimeLocal(value?: string) {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  const offsetMs = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16)
}

export function fromDateTimeLocal(value: string) {
  return new Date(value).toISOString()
}

export function getEntityInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('')
}

export function isEventRegistrationOpen(startsAt: string, registrationDeadline: string) {
  const now = Date.now()
  return new Date(startsAt).getTime() > now && new Date(registrationDeadline).getTime() >= now
}

export function shouldShowEventRegistrationAction(event: Pick<EventItem, 'canManage'>) {
  return !event.canManage
}
