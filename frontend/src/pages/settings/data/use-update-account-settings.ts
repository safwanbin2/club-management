import { useMutation, useQueryClient } from '@tanstack/react-query'

import { setAuthUser } from '@common/globalStates/use-auth-store'
import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import type { UserProfile } from '@common/types/user'
import type { UpdateAccountSettingsPayload } from '../shared/types'

export default function useUpdateAccountSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateAccountSettingsPayload) =>
      request<ApiResponse<UserProfile>>('users/me/settings', payload, 'PATCH'),
    onSuccess: response => {
      setAuthUser(response.data)
      void queryClient.invalidateQueries({ queryKey: ['settings'] })
      void queryClient.invalidateQueries({ queryKey: ['profile'] })
    }
  })
}
