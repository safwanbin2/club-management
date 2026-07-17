import { useQuery } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import type { UserProfileDetail } from '../shared/types'

export default function useProfile(userId?: string) {
  const endpoint = userId ? `users/${userId}/profile` : 'users/me/profile'
  const query = useQuery({
    queryFn: ({ signal }) =>
      request<ApiResponse<UserProfileDetail>>(endpoint, undefined, 'GET', { signal }),
    queryKey: ['profile', userId ?? 'me'],
    retry: false,
    select: response => response.data
  })

  return {
    isProfileError: query.isError,
    isProfilePending: query.isPending,
    profile: query.data ?? null,
    refetchProfile: query.refetch
  }
}
