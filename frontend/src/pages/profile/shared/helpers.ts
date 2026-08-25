import type { ProfileEventSummary, UserProfileDetail, UserProfileDetailPayload } from './types'

export const emptyProfileEventSummary = {
  joinedCount: 0,
  joinedEvents: [],
  managedCount: 0,
  managedEvents: []
} satisfies ProfileEventSummary

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value))
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('')
}

export function normalizeProfileDetail(profile: UserProfileDetailPayload): UserProfileDetail {
  return {
    ...profile,
    eventSummary: profile.eventSummary ?? emptyProfileEventSummary
  }
}
