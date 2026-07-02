import { z } from 'zod'

export const createBookingSchema = z.object({
  eventId: z.string().uuid('eventId doit être un UUID valide'),
})

export type CreateBookingInput = z.infer<typeof createBookingSchema>
