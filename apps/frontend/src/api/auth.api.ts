import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { useAuthStore } from '@/store/auth.store'
import type { AuthResponse, LoginPayload, RegisterPayload } from '@/types'


export const authApi = {
  login: (payload: LoginPayload) =>
    api.post<AuthResponse>('/auth/login', payload).then((r) => r.data),

  register: (payload: RegisterPayload) =>
    api.post<AuthResponse>('/auth/register', payload).then((r) => r.data),

  logout: () => api.post('/auth/logout'),
}


export function useLogin() {
  const { setAuth } = useAuthStore()

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: ({ user, accessToken, refreshToken }) => {
      setAuth(user, accessToken, refreshToken)
    },
  })
}

export function useRegister() {
  const { setAuth } = useAuthStore()

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: ({ user, accessToken, refreshToken }) => {
      setAuth(user, accessToken, refreshToken)
    },
  })
}

export function useLogout() {
  const { clearAuth } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      clearAuth()
      queryClient.clear()
    },
  })
}
