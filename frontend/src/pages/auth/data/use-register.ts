import { useMutation } from '@tanstack/react-query'

import { setAuthSession } from '@common/globalStates/use-auth-store'
import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'
import type { AuthSession } from '@common/types/user'
import type { RegisterPayload } from '../shared/types'

export default function useRegister() {
  return useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      const response = await request<ApiResponse<AuthSession>>('auth/register', payload, 'POST', {
        skipAuth: true,
        skipAuthRefresh: true
      })

      setAuthSession(response.data)
      return response.data
    }
  })
}
