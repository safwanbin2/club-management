export default function getApiErrorMessage(error: unknown, fallback: string) {
  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    if (error.message.toLowerCase().includes('failed to fetch')) {
      return 'Could not reach the API. Check that the backend is running and the API URL is correct.'
    }

    return error.message
  }

  return fallback
}
