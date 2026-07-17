import { useMutation, useQueryClient } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import type { ResourceRequestItem, ReviewResourceRequestPayload } from '../shared/types'

export default function useReviewResourceRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ remarks, requestId, status }: ReviewResourceRequestPayload) =>
      request<ApiResponse<ResourceRequestItem>>(
        `resource-requests/${requestId}/review`,
        { remarks, status },
        'PATCH'
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['resource-requests'] })
      void queryClient.invalidateQueries({ queryKey: ['notifications'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    }
  })
}
