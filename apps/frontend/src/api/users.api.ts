import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { useAuthStore } from '@/store/auth.store'
import type { AuthUser, UpdateProfilePayload } from '@/types'


export const userKeys = {
  me: ['users', 'me'] as const,
}


export const usersApi = {
  getMe: () =>
    api.get<{ data: AuthUser }>('/users/user').then((r) => r.data.data),

  updateMe: (payload: UpdateProfilePayload) =>
    api.patch<{ data: AuthUser }>('/users/user', payload).then((r) => r.data.data),
}


export function useMe() {
  const accessToken = useAuthStore((s) => s.accessToken)
  return useQuery({
    queryKey: userKeys.me,
    queryFn: usersApi.getMe,
    enabled: !!accessToken,
  })
}

export function useUpdateMe() {
  const queryClient = useQueryClient()
  const { setAuth, accessToken, refreshToken } = useAuthStore()

  return useMutation({
    mutationFn: usersApi.updateMe,
    onSuccess: (updatedUser) => {
      if (accessToken && refreshToken) {
        setAuth(updatedUser, accessToken, refreshToken)
      }
      queryClient.invalidateQueries({ queryKey: userKeys.me })
    },
  })
}
