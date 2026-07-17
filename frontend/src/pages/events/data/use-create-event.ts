import { useMutation, useQueryClient } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import type { CreateEventPayload, EventItem } from '../shared/types'

export default function useCreateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateEventPayload) =>
      request<ApiResponse<EventItem>>('events', payload, 'POST'),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['events'] })
    }
  })
}
