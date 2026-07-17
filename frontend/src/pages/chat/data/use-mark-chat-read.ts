import { useMutation, useQueryClient } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import type { MarkChatReadPayload } from '../shared/types'

export default function useMarkChatRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ clubId, messageIds }: MarkChatReadPayload) =>
      request<ApiResponse<{ markedRead: number }>>(
        `chat/clubs/${clubId}/read`,
        { messageIds },
        'POST'
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['chat', 'clubs'] })
    }
  })
}
