import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import { buildSearchParams } from '../shared/helpers'
import type { ClubListPayload, ClubListResponse } from '../shared/types'

export default function useClubs(payload: ClubListPayload) {
  const query = useQuery({
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) =>
      request<ApiResponse<ClubListResponse>>(
        `clubs?${buildSearchParams(payload)}`,
        undefined,
        'GET',
        { signal }
      ),
    queryKey: ['clubs', 'list', payload],
    retry: false,
    select: response => response.data
  })

  return {
    clubs: query.data?.data ?? [],
    currentClubPage: query.data?.currentPage ?? payload.page,
    currentClubTotal: query.data?.currentTotal ?? 0,
    isClubsError: query.isError,
    isClubsFetching: query.isFetching,
    isClubsPending: query.isPending,
    lastClubPage: query.data?.lastPage ?? 1,
    refetchClubs: query.refetch,
    totalClubs: query.data?.total ?? 0
  }
}
