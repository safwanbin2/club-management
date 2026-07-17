import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import { buildSearchParams } from '../shared/helpers'
import type { EventRegistrationListResponse, EventRegistrationsPayload } from '../shared/types'

export default function useEventRegistrations(
  payload: EventRegistrationsPayload,
  enabled: boolean
) {
  const query = useQuery({
    enabled,
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) =>
      request<ApiResponse<EventRegistrationListResponse>>(
        `events/${payload.eventId}/registrations?${buildSearchParams(payload)}`,
        undefined,
        'GET',
        { signal }
      ),
    queryKey: ['events', 'registrations', payload],
    retry: false,
    select: response => response.data
  })

  return {
    eventRegistrations: query.data?.data ?? [],
    isEventRegistrationsError: query.isError,
    isEventRegistrationsPending: query.isPending,
    refetchEventRegistrations: query.refetch,
    totalEventRegistrations: query.data?.total ?? 0
  }
}
