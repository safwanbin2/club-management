import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import { buildSearchParams } from '../shared/helpers'
import type { ClubMembersPayload, ClubMembersResponse } from '../shared/types'

type UseClubMembersOptions = {
  enabled?: boolean
}

export default function useClubMembers(
  clubId: string | undefined,
  payload: ClubMembersPayload,
  options: UseClubMembersOptions = {}
) {
  const query = useQuery({
    enabled: Boolean(clubId) && (options.enabled ?? true),
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) =>
      request<ApiResponse<ClubMembersResponse>>(
        `clubs/${clubId}/memberships?${buildSearchParams(payload)}`,
        undefined,
        'GET',
        { signal }
      ),
    queryKey: ['clubs', 'members', clubId, payload],
    retry: false,
    select: response => response.data
  })

  return {
    clubMembers: query.data?.data ?? [],
    currentClubMemberPage: query.data?.currentPage ?? payload.page,
    isClubMembersError: query.isError,
    isClubMembersFetching: query.isFetching,
    isClubMembersPending: query.isPending,
    refetchClubMembers: query.refetch,
    totalClubMembers: query.data?.total ?? 0
  }
}
