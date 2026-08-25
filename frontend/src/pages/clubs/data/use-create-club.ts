import { useMutation, useQueryClient } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import type { ClubDetail, CreateClubPayload } from '../shared/types'

export default function useCreateClub() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateClubPayload) =>
      request<ApiResponse<ClubDetail>>('clubs', payload, 'POST'),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['clubs'] })
    }
  })
}
