import { useMutation, useQueryClient } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import type { CancelEventRegistrationPayload, EventRegistration } from '../shared/types'

export default function useCancelEventRegistration() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, reason }: CancelEventRegistrationPayload) =>
      request<ApiResponse<EventRegistration>>(
        `events/${eventId}/cancel-registration`,
        { reason },
        'POST'
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['events'] })
    }
  })
}
