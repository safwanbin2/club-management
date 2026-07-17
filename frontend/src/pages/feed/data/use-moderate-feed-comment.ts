import { useMutation, useQueryClient } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import type { FeedComment, ModerateFeedCommentPayload } from '../shared/types'

export default function useModerateFeedComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ commentId, moderationStatus, postId }: ModerateFeedCommentPayload) =>
      request<ApiResponse<FeedComment>>(
        `feed/posts/${postId}/comments/${commentId}/moderation`,
        { moderationStatus },
        'PATCH'
      ),
    onSuccess: (_response, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['feed', 'posts'] })
      void queryClient.invalidateQueries({ queryKey: ['feed', 'comments', variables.postId] })
    }
  })
}
