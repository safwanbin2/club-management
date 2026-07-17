import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import type { ChatMessageListResponse } from '../shared/types'

export default function useChatMessages(clubId: null | string) {
  const query = useQuery({
    enabled: Boolean(clubId),
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) =>
      request<ApiResponse<ChatMessageListResponse>>(
        `chat/clubs/${clubId}/messages?perPage=50`,
        undefined,
        'GET',
        { signal }
      ),
    queryKey: ['chat', 'messages', clubId],
    refetchInterval: 5000,
    retry: false,
    select: response => response.data
  })

  return {
    chatMessages: query.data?.data ?? [],
    isChatMessagesError: query.isError,
    isChatMessagesFetching: query.isFetching,
    isChatMessagesPending: query.isPending,
    refetchChatMessages: query.refetch,
    totalChatMessages: query.data?.total ?? 0
  }
}
