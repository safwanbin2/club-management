import { useMutation, useQueryClient } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import type { CreatePollPayload, PollItem } from '../shared/types'

export default function useCreatePoll() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreatePollPayload) =>
      request<ApiResponse<PollItem>>('polls', payload, 'POST'),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['polls'] })
    }
  })
}
