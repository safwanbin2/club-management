import { useMutation, useQueryClient } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import type { PollItem, VotePollPayload } from '../shared/types'

export default function useVotePoll() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ pollId, selectedOptionIds }: VotePollPayload) =>
      request<ApiResponse<PollItem>>(`polls/${pollId}/vote`, { selectedOptionIds }, 'POST'),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['polls'] })
    }
  })
}
