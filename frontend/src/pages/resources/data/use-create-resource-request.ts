import { useMutation, useQueryClient } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import type { CreateResourceRequestPayload, ResourceRequestItem } from '../shared/types'

export default function useCreateResourceRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateResourceRequestPayload) =>
      request<ApiResponse<ResourceRequestItem>>('resource-requests', payload, 'POST'),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['resource-requests'] })
      void queryClient.invalidateQueries({ queryKey: ['notifications'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    }
  })
}
