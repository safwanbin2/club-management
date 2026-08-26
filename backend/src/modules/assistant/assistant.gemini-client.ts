import { randomUUID } from 'node:crypto'

import { ApplicationError } from '../../utils/application-error.js'
import type {
  AssistantToolDeclaration,
  AssistantGeminiClient,
  GeminiFunctionCallStep,
  GeminiInteraction,
  GeminiInteractionRequest
} from './assistant.types.js'

const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta'
const CONVERSATION_TTL_MS = 15 * 60 * 1000

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
    signal?: AbortSignal
  }
) => Promise<FetchResponse>

type GeminiGenerateContentPart = {
  functionCall?: {
    args?: Record<string, unknown>
    id?: string
    name?: string
  }
  functionResponse?: {
    name: string
    response: unknown
  }
  text?: string
  thoughtSignature?: string
}

type GeminiGenerateContent = {
  parts?: GeminiGenerateContentPart[]
  role?: 'model' | 'user'
}

type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: GeminiGenerateContent
  }>
}

type StoredConversation = {
  contents: GeminiGenerateContent[]
  expiresAt: number
}

const conversations = new Map<string, StoredConversation>()

function isGeminiInteraction(value: unknown): value is GeminiInteraction {
  return Boolean(value && typeof value === 'object')
}

function isGeminiGenerateContentResponse(value: unknown): value is GeminiGenerateContentResponse {
  return Boolean(value && typeof value === 'object')
}

function toApplicationError() {
  return new ApplicationError(
    'Assistant service is temporarily unavailable.',
    502,
    'GEMINI_REQUEST_FAILED'
  )
}

function toTimeoutError() {
  return new ApplicationError(
    'Assistant response took too long. Try a shorter prompt or ask again in a moment.',
    504,
    'GEMINI_REQUEST_TIMEOUT'
  )
}

function isAbortError(error: unknown) {
  return error instanceof Error && error.name === 'AbortError'
}

function cleanupConversations() {
  const now = Date.now()

  for (const [conversationId, conversation] of conversations.entries()) {
    if (conversation.expiresAt <= now) {
      conversations.delete(conversationId)
    }
  }
}

function normalizeSchemaTypes(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(normalizeSchemaTypes)
  }

  if (!value || typeof value !== 'object') {
    return value
  }

  return Object.entries(value).reduce<Record<string, unknown>>((normalized, [key, fieldValue]) => {
    normalized[key] =
      key === 'type' && typeof fieldValue === 'string'
        ? fieldValue.toUpperCase()
        : normalizeSchemaTypes(fieldValue)
    return normalized
  }, {})
}

function toFunctionDeclarations(toolDeclarations: AssistantToolDeclaration[]) {
  return toolDeclarations.map(toolDeclaration => ({
    description: toolDeclaration.description,
    name: toolDeclaration.name,
    parameters: normalizeSchemaTypes(
      toolDeclaration.parameters ?? {
        properties: {},
        type: 'object'
      }
    )
  }))
}

function toFunctionCallStep(part: GeminiGenerateContentPart): GeminiFunctionCallStep | null {
  const functionCall = part.functionCall

  if (!functionCall?.name) {
    return null
  }

  return {
    arguments: functionCall.args ?? {},
    id: functionCall.id,
    name: functionCall.name,
    type: 'function_call'
  }
}

function parseFunctionResultText(value: string) {
  try {
    return JSON.parse(value) as unknown
  } catch {
    return {
      text: value
    }
  }
}

function toFunctionResponseParts(input: Extract<GeminiInteractionRequest['input'], unknown[]>) {
  return input.map(functionResult => ({
    functionResponse: {
      name: functionResult.name,
      response: parseFunctionResultText(functionResult.result[0]?.text ?? '{}')
    }
  }))
}

function toGeminiInteraction(content: GeminiGenerateContent): GeminiInteraction {
  const parts = content.parts ?? []
  const steps = parts.flatMap(part => {
    const functionCallStep = toFunctionCallStep(part)
    return functionCallStep ? [functionCallStep] : []
  })
  const outputText = parts
    .map(part => part.text ?? '')
    .join('')
    .trim()

  return {
    id: `gemini-${randomUUID()}`,
    output_text: outputText,
    steps
  }
}

export function createGeminiClient({
  apiKey,
  fetchImpl = globalThis.fetch as FetchImpl,
  timeoutMs = 45000
}: {
  apiKey: string
  fetchImpl?: FetchImpl
  timeoutMs?: number
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
      const abortController = new AbortController()
      const timeout = setTimeout(() => {
        abortController.abort()
      }, timeoutMs)
      const previousConversation = request.previous_interaction_id
        ? conversations.get(request.previous_interaction_id)
        : undefined
      const contents: GeminiGenerateContent[] =
        typeof request.input === 'string'
          ? [
              ...(previousConversation?.contents ?? []),
              {
                parts: [{ text: request.input }],
                role: 'user'
              }
            ]
          : [
              ...(previousConversation?.contents ?? []),
              {
                parts: toFunctionResponseParts(request.input),
                role: 'user'
              }
            ]
      const functionDeclarations = toFunctionDeclarations(request.tools)
      const requestBody = {
        contents,
        generationConfig: {
          maxOutputTokens: request.generation_config?.max_output_tokens
        },
        systemInstruction: {
          parts: [
            {
              text: request.system_instruction
            }
          ]
        },
        toolConfig: {
          functionCallingConfig: {
            mode: request.generation_config?.tool_choice === 'none' ? 'NONE' : 'AUTO'
          }
        },
        ...(functionDeclarations.length > 0
          ? {
              tools: [
                {
                  functionDeclarations
                }
              ]
            }
          : {})
      }

      try {
        response = await fetchImpl(`${GEMINI_API_BASE_URL}/${request.model}:generateContent`, {
          body: JSON.stringify(requestBody),
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey
          },
          method: 'POST',
          signal: abortController.signal
        })
      } catch (error) {
        if (isAbortError(error)) {
          throw toTimeoutError()
        }

        throw toApplicationError()
      } finally {
        clearTimeout(timeout)
      }

      let payload: unknown

      try {
        payload = await response.json()
      } catch {
        throw toApplicationError()
      }

      if (!response.ok || !isGeminiGenerateContentResponse(payload)) {
        throw toApplicationError()
      }

      const content = payload.candidates?.[0]?.content

      if (!content) {
        throw toApplicationError()
      }

      cleanupConversations()

      const interaction = toGeminiInteraction(content)
      const modelContent = {
        parts: content.parts ?? [],
        role: 'model' as const
      }

      conversations.set(interaction.id!, {
        contents: [...contents, modelContent],
        expiresAt: Date.now() + CONVERSATION_TTL_MS
      })

      if (!isGeminiInteraction(interaction)) {
        throw toApplicationError()
      }

      return interaction
    }
  }
}
