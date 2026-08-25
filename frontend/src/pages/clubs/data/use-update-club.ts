import { useMutation, useQueryClient } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import type { ClubDetail, UpdateClubPayload } from '../shared/types'

export default function useUpdateClub() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ clubId, ...payload }: UpdateClubPayload) =>
      request<ApiResponse<ClubDetail>>(`clubs/${clubId}`, payload, 'PATCH'),
    onSuccess: response => {
      void queryClient.invalidateQueries({ queryKey: ['clubs'] })
      void queryClient.invalidateQueries({ queryKey: ['clubs', 'detail', response.data.slug] })
    }
  })
}
