import { useMutation, useQueryClient } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import type { EventRegistrationListItem, ReviewEventRegistrationPayload } from '../shared/types'

export default function useReviewEventRegistration() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ action, eventId, registrationId, remarks }: ReviewEventRegistrationPayload) =>
      request<ApiResponse<EventRegistrationListItem>>(
        `events/${eventId}/registrations/${registrationId}/review`,
        { action, remarks },
        'PATCH'
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['events'] })
      void queryClient.invalidateQueries({ queryKey: ['events', 'registrations'] })
    }
  })
}
