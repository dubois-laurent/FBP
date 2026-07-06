import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { Message } from '@/types'
import { useAuthStore } from '@/store/auth.store'

export const messageKeys = {
  all: ['messages'] as const,
  conversation: (userId: string) => [...messageKeys.all, userId] as const,
}

export const messagesApi = {
  getConversation: (userId: string) =>
    api.get<{ data: Message[] }>(`/messages/${userId}`).then((r) => r.data.data),
}

export function useConversation(userId: string) {
  const accessToken = useAuthStore((s) => s.accessToken)
  return useQuery({
    queryKey: messageKeys.conversation(userId),
    queryFn: () => messagesApi.getConversation(userId),
    enabled: !!accessToken && !!userId,
    refetchInterval: false,
  })
}
