import { useMutation } from '@tanstack/react-query'

import { clearAuthSession } from '@common/globalStates/use-auth-store'
import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import type { ResetPasswordPayload } from '../shared/types'

export default function useResetPassword() {
  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) =>
      request<ApiResponse<null>>('auth/reset-password', payload, 'POST', {
        skipAuth: true,
        skipAuthRefresh: true
      }),
    onSuccess: () => {
      clearAuthSession()
    }
  })
}
