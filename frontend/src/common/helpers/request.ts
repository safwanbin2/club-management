import { env } from '@config/env'
import {
  clearAuthSession,
  getAuthAccessToken,
  setAuthSession
} from '@common/globalStates/use-auth-store'
import type { ApiResponse } from '@common/types/api'
import type { AuthSession } from '@common/types/user'

type RequestMethod = 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT'

type RequestOptions = {
  headers?: HeadersInit
  skipAuth?: boolean
  skipAuthRefresh?: boolean
  signal?: AbortSignal
}

let refreshPromise: null | Promise<AuthSession> = null

async function parseJsonResponse<TResponse>(response: Response) {
  return (await response.json()) as TResponse
}

export async function refreshAuthSession() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${env.apiUrl}/auth/refresh`, {
      credentials: 'include',
      method: 'POST'
    })
      .then(async response => {
        const data = await parseJsonResponse<ApiResponse<AuthSession>>(response)

        if (!response.ok) {
          clearAuthSession()
          throw data
        }

        setAuthSession(data.data)
        return data.data
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

async function sendRequest<TResponse>(
  endpoint: string,
  payload?: unknown,
  method: RequestMethod = 'GET',
  options: RequestOptions = {},
  hasRetried = false
) {
  const headers = new Headers(options.headers)
  const accessToken = getAuthAccessToken()

  if (payload !== undefined) {
    headers.set('Content-Type', 'application/json')
  }

  if (accessToken && !options.skipAuth) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  const response = await fetch(`${env.apiUrl}/${endpoint.replace(/^\/+/, '')}`, {
    body: payload === undefined ? undefined : JSON.stringify(payload),
    credentials: 'include',
    headers,
    method,
    signal: options.signal
  })

  if (response.status === 401 && !hasRetried && !options.skipAuthRefresh) {
    await refreshAuthSession()
    return sendRequest<TResponse>(endpoint, payload, method, options, true)
  }

  const data = await parseJsonResponse<TResponse>(response)

  if (!response.ok) {
    throw data
  }

  return data
}

export async function request<TResponse>(
  endpoint: string,
  payload?: unknown,
  method: RequestMethod = 'GET',
  options: RequestOptions = {}
) {
  return sendRequest<TResponse>(endpoint, payload, method, options)
}
