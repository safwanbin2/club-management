import { env } from './env.js'

const developmentFrontendOrigin = 'http://localhost:5173'
const productionFrontendOrigins = [
  'https://club-management-frontend-alpha.vercel.app',
  'https://club-management-frontend.vercel.app'
]

type NodeEnv = 'development' | 'test' | 'production'

type CorsOriginConfig = {
  frontendOrigin?: string
  frontendOrigins?: string
  nodeEnv?: NodeEnv
}

export function normalizeCorsOrigin(origin: string) {
  return origin.trim().replace(/\/+$/, '')
}

function getPrimaryFrontendOrigin(frontendOrigin: string, nodeEnv: NodeEnv) {
  if (nodeEnv === 'production' && frontendOrigin === developmentFrontendOrigin) {
    return ''
  }

  return frontendOrigin
}

export function getCorsOrigins({
  frontendOrigin = env.FRONTEND_ORIGIN,
  frontendOrigins = env.FRONTEND_ORIGINS,
  nodeEnv = env.NODE_ENV
}: CorsOriginConfig = {}) {
  return Array.from(
    new Set(
      [
        getPrimaryFrontendOrigin(frontendOrigin, nodeEnv),
        ...frontendOrigins.split(','),
        ...(nodeEnv === 'production' ? productionFrontendOrigins : [])
      ]
        .map(normalizeCorsOrigin)
        .filter(Boolean)
    )
  )
}

export function getConfiguredOrigins() {
  return getCorsOrigins()
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
