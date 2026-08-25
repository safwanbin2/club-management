import { useMutation } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import type { AssistantChatPayload, AssistantChatResponse } from '../shared/types'

export default function useSendAssistantMessage() {
  return useMutation({
    mutationFn: async (payload: AssistantChatPayload) => {
      const response = await request<ApiResponse<AssistantChatResponse>>(
        'assistant/chat',
        payload,
        'POST'
      )

      return response.data
    }
  })
}
