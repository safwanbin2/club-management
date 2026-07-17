import { create } from 'zustand'

import type { AuthSession, UserProfile } from '@common/types/user'

type AuthStatus = 'authenticated' | 'guest' | 'unknown'

type AuthStore = {
  accessToken: null | string
  actions: {
    clearSession: () => void
    markGuest: () => void
    setSession: (session: AuthSession) => void
    setUser: (user: UserProfile) => void
  }
  status: AuthStatus
  user: null | UserProfile
}

const authSessionMarkerKey = 'campushub.hasAuthSession'

function canUseStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage)
}

function setAuthSessionMarker() {
  if (canUseStorage()) {
    window.localStorage.setItem(authSessionMarkerKey, 'true')
  }
}

function clearAuthSessionMarker() {
  if (canUseStorage()) {
    window.localStorage.removeItem(authSessionMarkerKey)
  }
}

const useAuthStore = create<AuthStore>(set => ({
  accessToken: null,
  actions: {
    clearSession: () => {
      clearAuthSessionMarker()
      set({
        accessToken: null,
        status: 'guest',
        user: null
      })
    },
    markGuest: () => {
      clearAuthSessionMarker()
      set({
        accessToken: null,
        status: 'guest',
        user: null
      })
    },
    setSession: session => {
      setAuthSessionMarker()
      set({
        accessToken: session.accessToken,
        status: 'authenticated',
        user: session.user
      })
    },
    setUser: user =>
      set(state => ({
        status: 'authenticated',
        user: state.user ? user : state.user
      }))
  },
  status: 'unknown',
  user: null
}))

export const getAuthAccessToken = () => useAuthStore.getState().accessToken
export const setAuthSession = (session: AuthSession) =>
  useAuthStore.getState().actions.setSession(session)
export const setAuthUser = (user: UserProfile) => useAuthStore.getState().actions.setUser(user)
export const clearAuthSession = () => useAuthStore.getState().actions.clearSession()
export const hasAuthSessionMarker = () =>
  canUseStorage() && window.localStorage.getItem(authSessionMarkerKey) === 'true'

export const useAuthActions = () => useAuthStore(state => state.actions)
export const useAuthStatus = () => useAuthStore(state => state.status)
export const useAuthUser = () => useAuthStore(state => state.user)
