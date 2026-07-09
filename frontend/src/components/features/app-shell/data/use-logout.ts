import { useMutation } from '@tanstack/react-query'

import { clearAuthSession } from '@common/globalStates/use-auth-store'
import { request } from '@common/helpers/request'
import type { ApiResponse } from '@common/types/api'

export default function useLogout() {
  return useMutation({
    mutationFn: () =>
      request<ApiResponse<null>>('auth/logout', undefined, 'POST', {
        skipAuthRefresh: true
      }),
    onSettled: () => {
      clearAuthSession()
    }
  })
}
