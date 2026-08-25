export function getDefaultApiUrl(isProduction = import.meta.env.PROD) {
  return isProduction ? '/api' : 'http://localhost:5000/api'
}

export function normalizeApiUrl(value: string | undefined, defaultApiUrl = getDefaultApiUrl()) {
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
