import type {
  ClubCategory,
  ClubListPayload,
  ClubMembershipStatus,
  ClubStatus,
  MembershipRequestsPayload
} from './types'
import { CLUB_CATEGORY_LABELS, CLUB_STATUS_LABELS, MEMBERSHIP_STATUS_LABELS } from './constants'

const clubCategories: ClubCategory[] = [
  'academic',
  'arts',
  'community_service',
  'culture',
  'entrepreneurship',
  'sports',
  'technology'
]

const clubStatuses: ClubStatus[] = ['active', 'disabled', 'pending']
const membershipStatuses: ClubMembershipStatus[] = ['active', 'left', 'pending', 'rejected']

export function parseClubCategory(value: null | string) {
  return clubCategories.includes(value as ClubCategory) ? (value as ClubCategory) : undefined
}

export function parseMembershipStatus(value: null | string) {
  if (value === 'none') {
    return value
  }

  return membershipStatuses.includes(value as ClubMembershipStatus)
    ? (value as ClubMembershipStatus)
    : undefined
}

export function parseClubStatus(value: null | string) {
  return clubStatuses.includes(value as ClubStatus) ? (value as ClubStatus) : undefined
}

export function parsePage(value: null | string, fallback = 1) {
  const page = Number(value)
  return Number.isInteger(page) && page > 0 ? page : fallback
}

export function parsePerPage(value: null | string, fallback = 9) {
  const perPage = Number(value)
  return Number.isInteger(perPage) && perPage > 0 ? Math.min(perPage, 48) : fallback
}

export function parseSort(value: null | string): Pick<ClubListPayload, 'sortBy' | 'sortOrder'> {
  if (value === 'createdAt:desc') {
    return { sortBy: 'createdAt', sortOrder: 'desc' }
  }

  if (value === 'updatedAt:desc') {
    return { sortBy: 'updatedAt', sortOrder: 'desc' }
  }

  return { sortBy: 'name', sortOrder: 'asc' }
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

export function getClubInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('')
}

export function formatClubCategory(category: ClubCategory) {
  return CLUB_CATEGORY_LABELS[category]
}

export function formatClubStatus(status: ClubStatus) {
  return CLUB_STATUS_LABELS[status]
}

export function formatMembershipStatus(status: ClubMembershipStatus) {
  return MEMBERSHIP_STATUS_LABELS[status]
}

export function formatMemberCount(count: number) {
  return new Intl.NumberFormat('en-US').format(count)
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value))
}

export function createMembershipRequestsPayload(page = 1, perPage = 6): MembershipRequestsPayload {
  return {
    page,
    perPage,
    status: 'pending'
  }
}
