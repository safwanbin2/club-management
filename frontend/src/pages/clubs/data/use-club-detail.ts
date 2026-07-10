import { useQuery } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import type { ClubDetail } from '../shared/types'

export default function useClubDetail(clubId?: string) {
  const query = useQuery({
    enabled: Boolean(clubId),
    queryFn: ({ signal }) =>
      request<ApiResponse<ClubDetail>>(`clubs/${clubId}`, undefined, 'GET', { signal }),
    queryKey: ['clubs', 'detail', clubId],
    retry: false,
    select: response => response.data
  })

  return {
    clubDetail: query.data,
    isClubDetailError: query.isError,
    isClubDetailPending: query.isPending,
    refetchClubDetail: query.refetch
  }
}
