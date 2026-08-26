import type { UserDto } from '../user/user.types.js'

export type AssistantToolDeclaration = {
  description: string
  name: string
  parameters?: {
    properties?: Record<string, unknown>
    required?: string[]
    type: 'object'
  }
  type: 'function'
}

export type GeminiFunctionCallStep = {
  arguments?: Record<string, unknown>
  id?: string
  name?: string
  type: 'function_call'
}

export type GeminiModelOutputStep = {
  content?: Array<{
    text?: string
    type?: string
  }>
  type: 'model_output'
}

export type GeminiInteractionStep =
  GeminiFunctionCallStep | GeminiModelOutputStep | Record<string, unknown>

export type GeminiInteraction = {
  id?: string
  output_text?: string
  steps?: GeminiInteractionStep[]
}

export type GeminiInteractionRequest = {
  generation_config?: {
    max_output_tokens?: number
    tool_choice?: 'auto' | 'none'
  }
  input:
    | string
    | Array<{
        call_id?: string
        is_error?: boolean
        name: string
        result: Array<{ text: string; type: 'text' }>
        type: 'function_result'
      }>
  model: string
  previous_interaction_id?: string
  system_instruction: string
  tools: AssistantToolDeclaration[]
}

export type AssistantGeminiClient = {
  createInteraction(request: GeminiInteractionRequest): Promise<GeminiInteraction>
}

export type AssistantToolExecutor = (
  name: string,
  args: Record<string, unknown>,
  actor: UserDto
) => Promise<unknown>

export type AssistantChatInput = {
  message: string
  previousInteractionId?: string
}

export type AssistantRunStatus = 'completed' | 'failed' | 'pending'

export type AssistantToolTrace = {
  label: string
  name: string
  status: 'error' | 'success'
}

export type AssistantChatResult = {
  interactionId: string | null
  message: string
  toolsUsed: AssistantToolTrace[]
}

export type AssistantRunSnapshot = {
  createdAt: string
  error: null | {
    code: string
    message: string
  }
  result: AssistantChatResult | null
  runId: string
  status: AssistantRunStatus
  updatedAt: string
}
