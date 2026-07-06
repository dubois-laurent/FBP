import { eq, and, gte, lt, sql } from 'drizzle-orm'
import { db } from '../../config/db'
import { events } from '../../db/schema'
import { AppError } from '../../lib/AppError'
import type { CreateEventInput, UpdateEventInput, EventsQuery } from '../../schemas/events'

export async function listEvents(query: EventsQuery) {
  const { type, date, page, limit } = query
  const offset = (page - 1) * limit

  const conditions = []
  if (type) conditions.push(eq(events.type, type))
  if (date) {
    const start = new Date(date)
    const end = new Date(date)
    end.setDate(end.getDate() + 1)
    conditions.push(gte(events.date, start))
    conditions.push(lt(events.date, end))
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined

  const rows = await db.query.events.findMany({
    where,
    limit,
    offset,
    orderBy: (e, { asc }) => [asc(e.date)],
  })

  const [{ count }] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(events)
    .where(where)

  return {
    data: rows,
    meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
  }
}

export async function getEventById(id: string) {
  const event = await db.query.events.findFirst({ where: eq(events.id, id) })
  if (!event) throw AppError.notFound('Événement introuvable')
  return event
}

export async function createEvent(input: CreateEventInput) {
  const [event] = await db
    .insert(events)
    .values({ ...input, date: new Date(input.date), availableSeats: input.totalSeats })
    .returning()
  return event
}

export async function updateEvent(id: string, input: UpdateEventInput) {
  await getEventById(id)
  const data: Record<string, unknown> = { ...input, updatedAt: new Date() }
  if (input.date) data.date = new Date(input.date)
  const [updated] = await db.update(events).set(data).where(eq(events.id, id)).returning()
  return updated
}

export async function deleteEvent(id: string) {
  await getEventById(id)
  await db.delete(events).where(eq(events.id, id))
}
