import { useQuery } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import type { AccountSettings } from '../shared/types'

export default function useAccountSettings() {
  const query = useQuery({
    queryFn: ({ signal }) =>
      request<ApiResponse<AccountSettings>>('users/me/settings', undefined, 'GET', { signal }),
    queryKey: ['settings', 'account'],
    retry: false,
    select: response => response.data
  })

  return {
    accountSettings: query.data ?? null,
    isAccountSettingsError: query.isError,
    isAccountSettingsPending: query.isPending,
    refetchAccountSettings: query.refetch
  }
}
