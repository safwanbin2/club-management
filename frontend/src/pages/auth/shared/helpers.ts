import type { ApiResponse } from '@common/types/api'

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.'
) {
  const apiError = error as Partial<ApiResponse<unknown>>
  return typeof apiError?.message === 'string' ? apiError.message : fallback
}
