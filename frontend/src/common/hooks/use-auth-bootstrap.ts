import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'

import {
  hasAuthSessionMarker,
  useAuthActions,
  useAuthStatus
} from '@common/globalStates/use-auth-store'
import { refreshAuthSession } from '@common/helpers/request'

export function useAuthBootstrap() {
  const status = useAuthStatus()
  const { markGuest } = useAuthActions()
  const shouldRefreshSession = status === 'unknown' && hasAuthSessionMarker()
  const query = useQuery({
    enabled: shouldRefreshSession,
    queryFn: refreshAuthSession,
    queryKey: ['auth', 'bootstrap'],
    retry: false
  })

  useEffect(() => {
    if (status === 'unknown' && !shouldRefreshSession) {
      markGuest()
    }
  }, [markGuest, shouldRefreshSession, status])

  useEffect(() => {
    if (query.isError) {
      markGuest()
    }
  }, [markGuest, query.isError])

  return {
    isAuthBootstrapping: shouldRefreshSession && query.isPending
  }
}
