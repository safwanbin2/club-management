import { useMutation, useQueryClient } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import type { FeedPost, ModerateFeedPostPayload } from '../shared/types'

export default function useModerateFeedPost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ postId, ...payload }: ModerateFeedPostPayload) =>
      request<ApiResponse<FeedPost>>(`feed/posts/${postId}/moderation`, payload, 'PATCH'),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['feed'] })
    }
  })
}
