import { useMutation, useQueryClient } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import type { ChatMessage, ModerateChatMessagePayload } from '../shared/types'

export default function useModerateChatMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ action, messageId }: ModerateChatMessagePayload) =>
      request<ApiResponse<ChatMessage>>(
        `chat/messages/${messageId}/moderation`,
        { action },
        'PATCH'
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['chat'] })
    }
  })
}
