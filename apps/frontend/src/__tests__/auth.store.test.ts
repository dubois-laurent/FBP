import { describe, it, expect, beforeEach } from 'vitest'
import {
  useAuthStore,
  selectIsAuthenticated,
  selectIsAdmin,
  type AuthUser,
} from '@/store/auth.store'

const mockUser: AuthUser = {
  id: 'uuid-1',
  email: 'user@test.com',
  name: 'Test User',
  role: 'user',
}

const mockAdmin: AuthUser = { ...mockUser, role: 'admin' }

beforeEach(() => {
  localStorage.clear()
  useAuthStore.getState().clearAuth()
})

describe('useAuthStore — état initial', () => {
  it('démarre non authentifié', () => {
    const { user, accessToken, refreshToken } = useAuthStore.getState()
    expect(user).toBeNull()
    expect(accessToken).toBeNull()
    expect(refreshToken).toBeNull()
  })
})

describe('useAuthStore — setAuth', () => {
  it('stocke user et tokens', () => {
    useAuthStore.getState().setAuth(mockUser, 'acc', 'ref')
    const { user, accessToken, refreshToken } = useAuthStore.getState()
    expect(user).toEqual(mockUser)
    expect(accessToken).toBe('acc')
    expect(refreshToken).toBe('ref')
  })
})

describe('useAuthStore — setTokens', () => {
  it('met à jour les tokens sans toucher au user', () => {
    useAuthStore.getState().setAuth(mockUser, 'acc', 'ref')
    useAuthStore.getState().setTokens('new-acc', 'new-ref')
    const { user, accessToken, refreshToken } = useAuthStore.getState()
    expect(user).toEqual(mockUser)
    expect(accessToken).toBe('new-acc')
    expect(refreshToken).toBe('new-ref')
  })
})

describe('useAuthStore — clearAuth', () => {
  it('réinitialise tout', () => {
    useAuthStore.getState().setAuth(mockUser, 'acc', 'ref')
    useAuthStore.getState().clearAuth()
    const { user, accessToken, refreshToken } = useAuthStore.getState()
    expect(user).toBeNull()
    expect(accessToken).toBeNull()
    expect(refreshToken).toBeNull()
  })
})

describe('selectIsAuthenticated', () => {
  it('retourne false sans token', () => {
    expect(selectIsAuthenticated(useAuthStore.getState())).toBe(false)
  })

  it('retourne true avec token', () => {
    useAuthStore.getState().setAuth(mockUser, 'acc', 'ref')
    expect(selectIsAuthenticated(useAuthStore.getState())).toBe(true)
  })
})

describe('selectIsAdmin', () => {
  it('retourne false pour un user normal', () => {
    useAuthStore.getState().setAuth(mockUser, 'acc', 'ref')
    expect(selectIsAdmin(useAuthStore.getState())).toBe(false)
  })

  it('retourne true pour un admin', () => {
    useAuthStore.getState().setAuth(mockAdmin, 'acc', 'ref')
    expect(selectIsAdmin(useAuthStore.getState())).toBe(true)
  })
})
