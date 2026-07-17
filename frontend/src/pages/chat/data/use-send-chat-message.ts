import { useMutation, useQueryClient } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import type { ChatMessage, SendChatMessagePayload } from '../shared/types'

export default function useSendChatMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ attachments = [], body, clubId, parentMessageId }: SendChatMessagePayload) =>
      request<ApiResponse<ChatMessage>>(
        `chat/clubs/${clubId}/messages`,
        { attachments, body, parentMessageId },
        'POST'
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['chat'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    }
  })
}
