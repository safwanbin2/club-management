import { useMutation, useQueryClient } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import type { CreateFeedCommentPayload, FeedComment } from '../shared/types'

export default function useCreatePostComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ body, postId }: CreateFeedCommentPayload) =>
      request<ApiResponse<FeedComment>>(`feed/posts/${postId}/comments`, { body }, 'POST'),
    onSuccess: (_response, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['feed', 'posts'] })
      void queryClient.invalidateQueries({ queryKey: ['feed', 'comments', variables.postId] })
    }
  })
}
