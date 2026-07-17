export function buildSearchParams(payload: Record<string, null | number | string | undefined>) {
  const params = new URLSearchParams()

  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value))
    }
  })

  return params.toString()
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value))
}

export function parsePage(value: null | string, fallback = 1) {
  const page = Number(value)
  return Number.isInteger(page) && page > 0 ? page : fallback
}

export function parseNotificationStatus(value: null | string) {
  return value === 'read' || value === 'unread' ? value : 'all'
}
