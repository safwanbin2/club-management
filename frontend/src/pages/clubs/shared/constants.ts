import type { ClubCategory, ClubMembershipStatus, ClubStatus } from './types'

export const CLUB_CATEGORY_OPTIONS: { label: string; value: 'all' | ClubCategory }[] = [
  { label: 'All Clubs', value: 'all' },
  { label: 'Academic', value: 'academic' },
  { label: 'Arts', value: 'arts' },
  { label: 'Community Service', value: 'community_service' },
  { label: 'Culture', value: 'culture' },
  { label: 'Entrepreneurship', value: 'entrepreneurship' },
  { label: 'Sports', value: 'sports' },
  { label: 'Technology', value: 'technology' }
]

export const CLUB_CATEGORY_LABELS: Record<ClubCategory, string> = {
  academic: 'Academic',
  arts: 'Arts',
  community_service: 'Community Service',
  culture: 'Culture',
  entrepreneurship: 'Entrepreneurship',
  sports: 'Sports',
  technology: 'Technology'
}

export const CLUB_STATUS_LABELS: Record<ClubStatus, string> = {
  active: 'Active',
  disabled: 'Disabled',
  pending: 'Pending'
}

export const MEMBERSHIP_STATUS_LABELS: Record<ClubMembershipStatus, string> = {
  active: 'Member',
  left: 'Left',
  pending: 'Pending',
  rejected: 'Rejected'
}

export const membershipFilterOptions: {
  label: string
  value: 'all' | ClubMembershipStatus | 'none'
}[] = [
  { label: 'All Memberships', value: 'all' },
  { label: 'My Clubs', value: 'active' },
  { label: 'Pending', value: 'pending' },
  { label: 'Not Joined', value: 'none' }
]

export const sortOptions = [
  { label: 'Name A-Z', value: 'name:asc' },
  { label: 'Newest', value: 'createdAt:desc' },
  { label: 'Recently Updated', value: 'updatedAt:desc' }
] as const
