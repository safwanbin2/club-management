import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'

import { useAuthActions, useAuthStatus } from '@common/globalStates/use-auth-store'
import { refreshAuthSession } from '@common/helpers/request'

export function useAuthBootstrap() {
  const status = useAuthStatus()
  const { markGuest } = useAuthActions()
  const query = useQuery({
    enabled: status === 'unknown',
    queryFn: refreshAuthSession,
    queryKey: ['auth', 'bootstrap'],
    retry: false
  })

  useEffect(() => {
    if (query.isError) {
      markGuest()
    }
  }, [markGuest, query.isError])

  return {
    isAuthBootstrapping: status === 'unknown' && query.isPending
  }
}
