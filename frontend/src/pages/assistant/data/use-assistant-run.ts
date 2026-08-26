import { useQuery } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import type { AssistantRunResponse } from '../shared/types'

export default function useAssistantRun(runId: null | string) {
  const query = useQuery({
    enabled: Boolean(runId),
    queryFn: ({ signal }) =>
      request<ApiResponse<AssistantRunResponse>>(`assistant/chat/${runId}`, undefined, 'GET', {
        signal
      }),
    queryKey: ['assistant', 'run', runId],
    refetchInterval: 1500,
    retry: false,
    select: response => response.data
  })

  return {
    assistantRun: query.data,
    assistantRunError: query.error,
    isAssistantRunError: query.isError,
    isAssistantRunFetching: query.isFetching
  }
}
