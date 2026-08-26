import type { AssistantChatResponse, AssistantMessage } from './types'

export const ASSISTANT_PENDING_CONTENT = 'Thinking through your request...'

export function createAssistantExchangeMessages(
  prompt: string,
  response: AssistantChatResponse,
  createdAt = new Date()
): AssistantMessage[] {
  const timestamp = createdAt.toISOString()

  return [
    {
      content: prompt,
      createdAt: timestamp,
      id: `user-${timestamp}`,
      role: 'user',
      toolsUsed: []
    },
    {
      content: response.message,
      createdAt: timestamp,
      id: `assistant-${timestamp}`,
      interactionId: response.interactionId,
      role: 'assistant',
      toolsUsed: response.toolsUsed
    }
  ]
}

export function createPendingAssistantExchangeMessages(prompt: string, createdAt = new Date()) {
  const timestamp = createdAt.toISOString()
  const assistantMessageId = `assistant-${timestamp}`

  return {
    assistantMessageId,
    messages: [
      {
        content: prompt,
        createdAt: timestamp,
        id: `user-${timestamp}`,
        role: 'user',
        status: 'complete',
        toolsUsed: []
      },
      {
        content: ASSISTANT_PENDING_CONTENT,
        createdAt: timestamp,
        id: assistantMessageId,
        role: 'assistant',
        status: 'pending',
        toolsUsed: []
      }
    ] satisfies AssistantMessage[]
  }
}

export function replaceAssistantPendingMessage(
  messages: AssistantMessage[],
  assistantMessageId: string,
  response: AssistantChatResponse,
  createdAt = new Date()
): AssistantMessage[] {
  const timestamp = createdAt.toISOString()

  return messages.map(message => {
    if (message.id !== assistantMessageId) {
      return message
    }

    return {
      content: response.message,
      createdAt: timestamp,
      id: assistantMessageId,
      interactionId: response.interactionId,
      role: 'assistant',
      status: 'complete',
      toolsUsed: response.toolsUsed
    } satisfies AssistantMessage
  })
}

export function replaceAssistantPendingMessageWithError(
  messages: AssistantMessage[],
  assistantMessageId: string,
  errorMessage: string,
  createdAt = new Date()
): AssistantMessage[] {
  const timestamp = createdAt.toISOString()

  return messages.map(message => {
    if (message.id !== assistantMessageId) {
      return message
    }

    return {
      ...message,
      content: errorMessage,
      createdAt: timestamp,
      status: 'error' as const,
      toolsUsed: []
    }
  })
}

export function formatAssistantTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(value))
}
