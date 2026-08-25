import { useMutation, useQueryClient } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import type { EventRegistration, RegisterEventPayload } from '../shared/types'

export default function useRegisterEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, paymentTransactionId }: RegisterEventPayload) =>
      request<ApiResponse<EventRegistration>>(
        `events/${eventId}/register`,
        { paymentTransactionId },
        'POST'
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['events'] })
      void queryClient.invalidateQueries({ queryKey: ['events', 'registrations'] })
    }
  })
}
