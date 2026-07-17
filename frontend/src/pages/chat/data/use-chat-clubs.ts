import { useQuery } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import type { ChatClub } from '../shared/types'

export default function useChatClubs() {
  const query = useQuery({
    queryFn: ({ signal }) =>
      request<ApiResponse<ChatClub[]>>('chat/clubs', undefined, 'GET', { signal }),
    queryKey: ['chat', 'clubs'],
    refetchInterval: 10000,
    retry: false,
    select: response => response.data
  })

  return {
    chatClubs: query.data ?? [],
    isChatClubsError: query.isError,
    isChatClubsPending: query.isPending,
    refetchChatClubs: query.refetch
  }
}
