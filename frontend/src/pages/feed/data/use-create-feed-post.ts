import { useMutation, useQueryClient } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import type { CreateFeedPostPayload, FeedPost } from '../shared/types'

export default function useCreateFeedPost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateFeedPostPayload) =>
      request<ApiResponse<FeedPost>>('feed/posts', payload, 'POST'),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['feed'] })
    }
  })
}
