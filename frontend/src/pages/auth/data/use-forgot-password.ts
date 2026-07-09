import { useMutation } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import type { ForgotPasswordPayload, ForgotPasswordResult } from '../shared/types'

export default function useForgotPassword() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) =>
      request<ApiResponse<ForgotPasswordResult>>('auth/forgot-password', payload, 'POST', {
        skipAuth: true,
        skipAuthRefresh: true
      })
  })
}
