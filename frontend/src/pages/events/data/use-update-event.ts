import { useMutation, useQueryClient } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import type { EventItem, UpdateEventPayload } from '../shared/types'

export default function useUpdateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, ...payload }: UpdateEventPayload) =>
      request<ApiResponse<EventItem>>(`events/${eventId}`, payload, 'PATCH'),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['events'] })
    }
  })
}
