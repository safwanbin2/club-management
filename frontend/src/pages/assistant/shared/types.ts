export type AssistantToolTrace = {
  label: string
  name: string
  status: 'error' | 'success'
}

export type AssistantChatResponse = {
  interactionId: string | null
  message: string
  toolsUsed: AssistantToolTrace[]
}

export type AssistantChatPayload = {
  message: string
  previousInteractionId?: string
}

export type AssistantMessageStatus = 'complete' | 'error' | 'pending'

export type AssistantMessage = {
  content: string
  createdAt: string
  id: string
  interactionId?: string | null
  role: 'assistant' | 'user'
  status?: AssistantMessageStatus
  toolsUsed: AssistantToolTrace[]
}
