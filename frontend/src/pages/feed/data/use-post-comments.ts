import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import { buildSearchParams } from '../shared/helpers'
import type { FeedCommentListResponse } from '../shared/types'

export default function usePostComments(postId: null | string, enabled: boolean) {
  const payload = {
    page: 1,
    perPage: 50
  }

  const query = useQuery({
    enabled,
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) =>
      request<ApiResponse<FeedCommentListResponse>>(
        `feed/posts/${postId}/comments?${buildSearchParams(payload)}`,
        undefined,
        'GET',
        { signal }
      ),
    queryKey: ['feed', 'comments', postId, payload],
    retry: false,
    select: response => response.data
  })

  return {
    comments: query.data?.data ?? [],
    isCommentsError: query.isError,
    isCommentsPending: query.isPending,
    refetchComments: query.refetch
  }
}
