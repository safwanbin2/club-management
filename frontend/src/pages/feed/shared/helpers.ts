import type { FeedListPayload, FeedPostType, FeedSort } from './types'
import { FEED_POST_TYPE_LABELS } from './constants'

const feedPostTypes: FeedPostType[] = ['achievement', 'announcement', 'event', 'poll', 'post']
const feedSorts: FeedSort[] = ['latest', 'popular']

export function parseFeedPostType(value: null | string) {
  return feedPostTypes.includes(value as FeedPostType) ? (value as FeedPostType) : undefined
}

export function parseFeedSort(value: null | string): FeedSort {
  return feedSorts.includes(value as FeedSort) ? (value as FeedSort) : 'latest'
}

export function parsePage(value: null | string, fallback = 1) {
  const page = Number(value)
  return Number.isInteger(page) && page > 0 ? page : fallback
}

export function parsePerPage(value: null | string, fallback = 8) {
  const perPage = Number(value)
  return Number.isInteger(perPage) && perPage > 0 ? Math.min(perPage, 20) : fallback
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

export function buildFeedSearchParams(payload: FeedListPayload) {
  return buildSearchParams(payload)
}

export function formatFeedPostType(type: FeedPostType) {
  return FEED_POST_TYPE_LABELS[type]
}

export function formatCount(count: number) {
  return new Intl.NumberFormat('en-US', {
    notation: count >= 1000 ? 'compact' : 'standard'
  }).format(count)
}

export function formatRelativeTime(value: string) {
  const date = new Date(value)
  const seconds = Math.round((Date.now() - date.getTime()) / 1000)
  const absoluteSeconds = Math.abs(seconds)
  const formatter = new Intl.RelativeTimeFormat('en-US', {
    numeric: 'auto'
  })

  if (absoluteSeconds < 60) {
    return formatter.format(-seconds, 'second')
  }

  const minutes = Math.round(seconds / 60)
  const absoluteMinutes = Math.abs(minutes)

  if (absoluteMinutes < 60) {
    return formatter.format(-minutes, 'minute')
  }

  const hours = Math.round(minutes / 60)
  const absoluteHours = Math.abs(hours)

  if (absoluteHours < 24) {
    return formatter.format(-hours, 'hour')
  }

  const days = Math.round(hours / 24)
  const absoluteDays = Math.abs(days)

  if (absoluteDays < 30) {
    return formatter.format(-days, 'day')
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium'
  }).format(date)
}

export function getEntityInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('')
}
