import { create } from 'zustand'

import type { AuthSession, UserProfile } from '@common/types/user'

type AuthStatus = 'authenticated' | 'guest' | 'unknown'

type AuthStore = {
  accessToken: null | string
  actions: {
    clearSession: () => void
    markGuest: () => void
    setSession: (session: AuthSession) => void
  }
  status: AuthStatus
  user: null | UserProfile
}

const useAuthStore = create<AuthStore>(set => ({
  accessToken: null,
  actions: {
    clearSession: () =>
      set({
        accessToken: null,
        status: 'guest',
        user: null
      }),
    markGuest: () =>
      set({
        accessToken: null,
        status: 'guest',
        user: null
      }),
    setSession: session =>
      set({
        accessToken: session.accessToken,
        status: 'authenticated',
        user: session.user
      })
  },
  status: 'unknown',
  user: null
}))

export const getAuthAccessToken = () => useAuthStore.getState().accessToken
export const setAuthSession = (session: AuthSession) =>
  useAuthStore.getState().actions.setSession(session)
export const clearAuthSession = () => useAuthStore.getState().actions.clearSession()

export const useAuthActions = () => useAuthStore(state => state.actions)
export const useAuthStatus = () => useAuthStore(state => state.status)
export const useAuthUser = () => useAuthStore(state => state.user)
