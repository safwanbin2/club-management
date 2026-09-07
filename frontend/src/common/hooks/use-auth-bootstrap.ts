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
  const isAuthUnknown = status === 'unknown'
  const shouldRefreshSession = isAuthUnknown && hasAuthSessionMarker()

  // Handle the refresh outcome inside the query itself. Reacting to `query.isError` in an
  // effect would re-run on every guard mount that shares the cached query, wiping a session
  // that was set later by login/register.
  useQuery({
    enabled: shouldRefreshSession,
    gcTime: 0,
    queryFn: async () => {
      try {
        return await refreshAuthSession()
      } catch (error) {
        markGuest()
        throw error
      }
    },
    queryKey: ['auth', 'bootstrap'],
    retry: false
  })

  useEffect(() => {
    if (isAuthUnknown && !shouldRefreshSession) {
      markGuest()
    }
  }, [isAuthUnknown, markGuest, shouldRefreshSession])

  return {
    isAuthBootstrapping: isAuthUnknown
  }
}
