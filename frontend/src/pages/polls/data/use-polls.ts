import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import { buildPollSearchParams } from '../shared/helpers'
import type { PollListPayload, PollListResponse } from '../shared/types'

export default function usePolls(payload: PollListPayload) {
  const query = useQuery({
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) =>
      request<ApiResponse<PollListResponse>>(
        `polls?${buildPollSearchParams(payload)}`,
        undefined,
        'GET',
        { signal }
      ),
    queryKey: ['polls', 'list', payload],
    retry: false,
    select: response => response.data
  })

  return {
    currentPollPage: query.data?.currentPage ?? payload.page,
    isPollsError: query.isError,
    isPollsFetching: query.isFetching,
    isPollsPending: query.isPending,
    lastPollPage: query.data?.lastPage ?? 1,
    polls: query.data?.data ?? [],
    refetchPolls: query.refetch,
    totalPolls: query.data?.total ?? 0
  }
}
