import { useMutation, useQueryClient } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import type { EventRegistration } from '../shared/types'

export default function useRegisterEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (eventId: string) =>
      request<ApiResponse<EventRegistration>>(`events/${eventId}/register`, undefined, 'POST'),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['events'] })
    }
  })
}
