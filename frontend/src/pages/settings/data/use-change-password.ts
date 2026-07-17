import { useMutation } from '@tanstack/react-query'

import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import type { ChangePasswordPayload } from '../shared/types'

export default function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) =>
      request<ApiResponse<{ changed: boolean }>>('users/me/password', payload, 'PATCH')
  })
}
