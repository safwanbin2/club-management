import { useQuery } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import { normalizeProfileDetail } from '../shared/helpers'
import type { UserProfileDetailPayload } from '../shared/types'

export default function useProfile(userId?: string) {
  const endpoint = userId ? `users/${userId}/profile` : 'users/me/profile'
  const query = useQuery({
    queryFn: ({ signal }) =>
      request<ApiResponse<UserProfileDetailPayload>>(endpoint, undefined, 'GET', { signal }),
    queryKey: ['profile', userId ?? 'me'],
    retry: false,
    select: response => normalizeProfileDetail(response.data)
  })

  return {
    isProfileError: query.isError,
    isProfilePending: query.isPending,
    profile: query.data ?? null,
    refetchProfile: query.refetch
  }
}
