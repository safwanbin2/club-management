import { ApplicationError } from '../../utils/application-error.js'
import type {
  AssistantGeminiClient,
  GeminiInteraction,
  GeminiInteractionRequest
} from './assistant.types.js'

const GEMINI_INTERACTIONS_URL = 'https://generativelanguage.googleapis.com/v1beta/interactions'

type FetchResponse = {
  json(): Promise<unknown>
  ok: boolean
  status: number
}

type FetchImpl = (
  url: string,
  init: {
    body: string
    headers: Record<string, string>
    method: 'POST'
  }
) => Promise<FetchResponse>

function isGeminiInteraction(value: unknown): value is GeminiInteraction {
  return Boolean(value && typeof value === 'object')
}

function toApplicationError() {
  return new ApplicationError(
    'Assistant service is temporarily unavailable.',
    502,
    'GEMINI_REQUEST_FAILED'
  )
}

export function createGeminiClient({
  apiKey,
  fetchImpl = globalThis.fetch as FetchImpl
}: {
  apiKey: string
  fetchImpl?: FetchImpl
}): AssistantGeminiClient {
  return {
    async createInteraction(request: GeminiInteractionRequest) {
      if (!apiKey.trim()) {
        throw new ApplicationError(
          'Assistant service is not configured.',
          503,
          'ASSISTANT_NOT_CONFIGURED'
        )
      }

      let response: FetchResponse

      try {
        response = await fetchImpl(GEMINI_INTERACTIONS_URL, {
          body: JSON.stringify(request),
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey
          },
          method: 'POST'
        })
      } catch {
        throw toApplicationError()
      }

      let payload: unknown

      try {
        payload = await response.json()
      } catch {
        throw toApplicationError()
      }

      if (!response.ok || !isGeminiInteraction(payload)) {
        throw toApplicationError()
      }

      return payload
    }
  }
}
