import { useMutation, useQueryClient } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import type { ClubMembership } from '../shared/types'

export default function useLeaveClub() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (clubId: string) =>
      request<ApiResponse<ClubMembership>>(`clubs/${clubId}/memberships/leave`, undefined, 'POST'),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['clubs'] })
    }
  })
}
