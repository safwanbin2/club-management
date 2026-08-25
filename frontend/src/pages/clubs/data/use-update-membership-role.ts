import { useMutation, useQueryClient } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import type { ClubMember, UpdateMembershipRolePayload } from '../shared/types'

export default function useUpdateMembershipRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      clubId,
      clubRole,
      executivePosition,
      membershipId
    }: UpdateMembershipRolePayload) =>
      request<ApiResponse<ClubMember>>(
        `clubs/${clubId}/memberships/${membershipId}/role`,
        { clubRole, executivePosition },
        'PATCH'
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['clubs'] })
      void queryClient.invalidateQueries({ queryKey: ['clubs', 'members'] })
    }
  })
}
