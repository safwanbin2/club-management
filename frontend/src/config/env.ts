const defaultApiUrl = 'http://localhost:5000/api'

export function normalizeApiUrl(value: string | undefined) {
  const trimmedValue = value?.trim()
  const apiUrl = (trimmedValue || defaultApiUrl).replace(/\/+$/, '')

  if (/^https?:\/\/[^/?#]+$/i.test(apiUrl)) {
    return `${apiUrl}/api`
  }

  return apiUrl
}

export const env = {
  apiUrl: normalizeApiUrl(import.meta.env.VITE_API_URL)
}
