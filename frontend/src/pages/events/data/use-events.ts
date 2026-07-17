import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import { buildEventSearchParams } from '../shared/helpers'
import type { EventListPayload, EventListResponse } from '../shared/types'

export default function useEvents(payload: EventListPayload) {
  const query = useQuery({
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) =>
      request<ApiResponse<EventListResponse>>(
        `events?${buildEventSearchParams(payload)}`,
        undefined,
        'GET',
        { signal }
      ),
    queryKey: ['events', 'list', payload],
    retry: false,
    select: response => response.data
  })

  return {
    currentEventPage: query.data?.currentPage ?? payload.page,
    events: query.data?.data ?? [],
    isEventsError: query.isError,
    isEventsFetching: query.isFetching,
    isEventsPending: query.isPending,
    lastEventPage: query.data?.lastPage ?? 1,
    refetchEvents: query.refetch,
    totalEvents: query.data?.total ?? 0
  }
}
