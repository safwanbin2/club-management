import { env } from '@config/env'

type RequestMethod = 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT'

type RequestOptions = {
  headers?: HeadersInit
  signal?: AbortSignal
}

export async function request<TResponse>(
  endpoint: string,
  payload?: unknown,
  method: RequestMethod = 'GET',
  options: RequestOptions = {}
) {
  const headers = new Headers(options.headers)

  if (payload !== undefined) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${env.apiUrl}/${endpoint.replace(/^\/+/, '')}`, {
    body: payload === undefined ? undefined : JSON.stringify(payload),
    headers,
    method,
    signal: options.signal
  })

  const data = (await response.json()) as TResponse

  if (!response.ok) {
    throw data
  }

  return data
}
