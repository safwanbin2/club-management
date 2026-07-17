import { useMutation, useQueryClient } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import type { EventItem } from '../shared/types'

export default function useDeleteEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (eventId: string) =>
      request<ApiResponse<EventItem>>(`events/${eventId}`, undefined, 'DELETE'),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['events'] })
    }
  })
}
