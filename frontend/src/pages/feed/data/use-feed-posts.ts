import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import { buildFeedSearchParams } from '../shared/helpers'
import type { FeedListPayload, FeedListResponse } from '../shared/types'

export default function useFeedPosts(payload: FeedListPayload) {
  const query = useQuery({
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) =>
      request<ApiResponse<FeedListResponse>>(
        `feed?${buildFeedSearchParams(payload)}`,
        undefined,
        'GET',
        { signal }
      ),
    queryKey: ['feed', 'posts', payload],
    retry: false,
    select: response => response.data
  })

  return {
    currentFeedPage: query.data?.currentPage ?? payload.page,
    feedPosts: query.data?.data ?? [],
    isFeedError: query.isError,
    isFeedFetching: query.isFetching,
    isFeedPending: query.isPending,
    lastFeedPage: query.data?.lastPage ?? 1,
    refetchFeed: query.refetch,
    totalFeedPosts: query.data?.total ?? 0
  }
}
