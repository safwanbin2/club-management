import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import { buildSearchParams } from '../shared/helpers'
import type { ClubMembershipRequestsResponse, MembershipRequestsPayload } from '../shared/types'

type UseMembershipRequestsOptions = {
  enabled?: boolean
}

export default function useMembershipRequests(
  clubId: string | undefined,
  payload: MembershipRequestsPayload,
  options: UseMembershipRequestsOptions = {}
) {
  const query = useQuery({
    enabled: Boolean(clubId) && (options.enabled ?? true),
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) =>
      request<ApiResponse<ClubMembershipRequestsResponse>>(
        `clubs/${clubId}/memberships/requests?${buildSearchParams(payload)}`,
        undefined,
        'GET',
        { signal }
      ),
    queryKey: ['clubs', 'membership-requests', clubId, payload],
    retry: false,
    select: response => response.data
  })

  return {
    currentRequestPage: query.data?.currentPage ?? payload.page,
    isMembershipRequestsError: query.isError,
    isMembershipRequestsFetching: query.isFetching,
    isMembershipRequestsPending: query.isPending,
    membershipRequests: query.data?.data ?? [],
    refetchMembershipRequests: query.refetch,
    totalMembershipRequests: query.data?.total ?? 0
  }
}
