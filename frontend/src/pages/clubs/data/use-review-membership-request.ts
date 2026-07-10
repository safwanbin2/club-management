import { useMutation, useQueryClient } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import type { ClubMembershipRequest, ReviewMembershipPayload } from '../shared/types'

export default function useReviewMembershipRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ action, clubId, membershipId, remarks }: ReviewMembershipPayload) =>
      request<ApiResponse<ClubMembershipRequest>>(
        `clubs/${clubId}/memberships/requests/${membershipId}`,
        { action, remarks },
        'PATCH'
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['clubs'] })
      void queryClient.invalidateQueries({ queryKey: ['clubs', 'membership-requests'] })
    }
  })
}
