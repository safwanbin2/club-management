import type { PollListPayload, PollScope, PollStatus } from './types'

const pollScopes: PollScope[] = ['all', 'managed', 'myClubs', 'voted']
const pollStatuses: Array<PollStatus | 'all'> = ['all', 'closed', 'draft', 'open']

export function parsePollScope(value: null | string): PollScope {
  return pollScopes.includes(value as PollScope) ? (value as PollScope) : 'all'
}

export function parsePollStatus(value: null | string): PollStatus | 'all' {
  return pollStatuses.includes(value as PollStatus | 'all') ? (value as PollStatus | 'all') : 'all'
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

export function buildPollSearchParams(payload: PollListPayload) {
  return buildSearchParams(payload)
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value))
}

export function formatPercent(value: number, total: number) {
  if (total <= 0) {
    return '0%'
  }

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
    style: 'percent'
  }).format(value / total)
}
