import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthUser } from '@/types'

export type { AuthUser }

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => void
  setTokens: (accessToken: string, refreshToken: string) => void
  clearAuth: () => void
}

export const selectIsAuthenticated = (s: AuthState) => s.accessToken !== null
export const selectIsAdmin = (s: AuthState) => s.user?.role === 'admin'

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken }),

      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),

      clearAuth: () =>
        set({ user: null, accessToken: null, refreshToken: null }),
    }),
    {
      name: 'fbp-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
)
