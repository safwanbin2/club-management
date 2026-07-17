import { useMutation, useQueryClient } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import type { PollItem, UpdatePollStatusPayload } from '../shared/types'

export default function useUpdatePollStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ pollId, status }: UpdatePollStatusPayload) =>
      request<ApiResponse<PollItem>>(`polls/${pollId}/status`, { status }, 'PATCH'),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['polls'] })
    }
  })
}
