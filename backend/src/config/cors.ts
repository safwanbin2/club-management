import { env } from './env.js'

export function normalizeCorsOrigin(origin: string) {
  return origin.trim().replace(/\/+$/, '')
}

export function getConfiguredOrigins() {
  return [env.FRONTEND_ORIGIN, ...env.FRONTEND_ORIGINS.split(',')]
    .map(normalizeCorsOrigin)
    .filter(Boolean)
}

export function isDevelopmentLocalOrigin(origin: string) {
  if (env.NODE_ENV === 'production') {
    return false
  }

  try {
    const url = new URL(origin)
    const hostname = url.hostname
    const isLoopback = ['0.0.0.0', '127.0.0.1', '::1', 'localhost'].includes(hostname)
    const isPrivateNetwork =
      /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
      /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
      /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(hostname)

    return ['http:', 'https:'].includes(url.protocol) && (isLoopback || isPrivateNetwork)
  } catch {
    return false
  }
}

export function isAllowedCorsOrigin(origin?: string | null) {
  if (!origin) {
    return true
  }

  const normalizedOrigin = normalizeCorsOrigin(origin)

  return (
    getConfiguredOrigins().includes(normalizedOrigin) || isDevelopmentLocalOrigin(normalizedOrigin)
  )
}
