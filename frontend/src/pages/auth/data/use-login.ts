import { useMutation } from '@tanstack/react-query'

import { setAuthSession } from '@common/globalStates/use-auth-store'
import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import type { AuthSession } from '@common/types/user'
import type { LoginPayload } from '../shared/types'

export default function useLogin() {
  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const response = await request<ApiResponse<AuthSession>>('auth/login', payload, 'POST', {
        skipAuth: true,
        skipAuthRefresh: true
      })

      setAuthSession(response.data)
      return response.data
    }
  })
}
