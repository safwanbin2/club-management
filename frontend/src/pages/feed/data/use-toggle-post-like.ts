import { useMutation, useQueryClient } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import type { FeedPost } from '../shared/types'

export default function useTogglePostLike() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (postId: string) =>
      request<ApiResponse<FeedPost>>(`feed/posts/${postId}/like`, undefined, 'POST'),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['feed'] })
    }
  })
}
