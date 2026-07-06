import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { Event, EventsFilters, PaginatedEvents, CreateEventPayload } from '@/types'

export type { Event, EventsFilters, CreateEventPayload }


export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  list: (filters: EventsFilters) => [...eventKeys.lists(), filters] as const,
  detail: (id: string) => [...eventKeys.all, 'detail', id] as const,
}


export const eventsApi = {
  list: (filters: EventsFilters = {}) =>
    api.get<PaginatedEvents>('/events', { params: filters }).then((r) => r.data),

  getById: (id: string) =>
    api.get<{ data: Event }>(`/events/${id}`).then((r) => r.data.data),

  create: (payload: CreateEventPayload) =>
    api.post<{ data: Event }>('/events', payload).then((r) => r.data.data),

  update: (id: string, payload: Partial<CreateEventPayload>) =>
    api.put<{ data: Event }>(`/events/${id}`, payload).then((r) => r.data.data),

  delete: (id: string) => api.delete(`/events/${id}`),
}

export function useEvents(filters: EventsFilters = {}) {
  return useQuery({
    queryKey: eventKeys.list(filters),
    queryFn: () => eventsApi.list(filters),
  })
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: () => eventsApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: eventsApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: eventKeys.lists() }),
  })
}

export function useUpdateEvent(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<CreateEventPayload>) => eventsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(id) })
    },
  })
}

export function useDeleteEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: eventsApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: eventKeys.lists() }),
  })
}
