import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { Booking } from '@/types'

export type { Booking }


export const bookingKeys = {
  all: ['bookings'] as const,
  mine: () => [...bookingKeys.all, 'mine'] as const,
}


export const bookingsApi = {
  listMine: () =>
    api.get<{ data: Booking[] }>('/bookings').then((r) => r.data.data),

  create: (eventId: string) =>
    api.post<{ data: Booking }>('/bookings', { eventId }).then((r) => r.data.data),

  cancel: (id: string) =>
    api.patch<{ data: Booking }>(`/bookings/${id}/cancel`).then((r) => r.data.data),
}


export function useMyBookings() {
  return useQuery({
    queryKey: bookingKeys.mine(),
    queryFn: bookingsApi.listMine,
  })
}

export function useCreateBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: bookingsApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: bookingKeys.mine() }),
  })
}

export function useCancelBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: bookingsApi.cancel,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: bookingKeys.mine() }),
  })
}
