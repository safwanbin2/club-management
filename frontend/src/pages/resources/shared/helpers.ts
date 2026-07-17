import type {
  ResourceRequestListPayload,
  ResourceRequestStatus,
  ResourceRequestType
} from './types'

const statuses: Array<ResourceRequestStatus | 'all'> = ['all', 'approved', 'pending', 'rejected']
const types: Array<ResourceRequestType | 'all'> = ['all', 'funding', 'room_booking']

export function parseResourceStatus(value: null | string): ResourceRequestStatus | 'all' {
  return statuses.includes(value as ResourceRequestStatus | 'all')
    ? (value as ResourceRequestStatus | 'all')
    : 'all'
}

export function parseResourceType(value: null | string): ResourceRequestType | 'all' {
  return types.includes(value as ResourceRequestType | 'all')
    ? (value as ResourceRequestType | 'all')
    : 'all'
}

export function parsePage(value: null | string, fallback = 1) {
  const page = Number(value)
  return Number.isInteger(page) && page > 0 ? page : fallback
}

export function parsePerPage(value: null | string, fallback = 8) {
  const perPage = Number(value)
  return Number.isInteger(perPage) && perPage > 0 ? Math.min(perPage, 24) : fallback
}

export function buildSearchParams(payload: ResourceRequestListPayload) {
  const params = new URLSearchParams()

  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value))
    }
  })

  return params.toString()
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium'
  }).format(new Date(value))
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value))
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat('en-US', {
    currency: 'USD',
    maximumFractionDigits: 0,
    style: 'currency'
  }).format(value)
}

export function fromDateTimeLocal(value: string) {
  return new Date(value).toISOString()
}

export function getStatusColor(status: ResourceRequestStatus) {
  if (status === 'approved') {
    return 'success'
  }

  if (status === 'rejected') {
    return 'error'
  }

  return 'warning'
}

export function getTypeLabel(type: ResourceRequestType) {
  return type === 'funding' ? 'Funding' : 'Room Booking'
}
