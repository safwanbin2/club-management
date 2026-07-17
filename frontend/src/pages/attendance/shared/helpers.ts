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

export function formatPercent(value: number, total: number) {
  if (total <= 0) {
    return '0%'
  }

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
    style: 'percent'
  }).format(value / total)
}
