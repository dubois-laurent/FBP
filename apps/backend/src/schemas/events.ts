import { z } from 'zod'

const eventTypeValues = ['exposition', 'conference', 'atelier', 'rencontre'] as const

export const createEventSchema = z.object({
  title: z.string().min(2).max(255),
  description: z.string().min(10),
  date: z.string().datetime({ message: 'Date invalide (ISO 8601 requis)' }),
  venue: z.string().min(2).max(255),
  totalSeats: z.number().int().positive(),
  imageUrl: z.string().url().optional(),
  type: z.enum(eventTypeValues),
})

export const updateEventSchema = createEventSchema.partial()

export const eventsQuerySchema = z.object({
  type: z.enum(eventTypeValues).optional(),
  date: z.string().date().optional(), // YYYY-MM-DD
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export type CreateEventInput = z.infer<typeof createEventSchema>
export type UpdateEventInput = z.infer<typeof updateEventSchema>
export type EventsQuery = z.infer<typeof eventsQuerySchema>
