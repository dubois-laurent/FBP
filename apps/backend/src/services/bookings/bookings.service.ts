import { eq, and } from 'drizzle-orm'
import { db } from '../../config/db'
import { bookings, events } from '../../db/schema'
import { AppError } from '../../lib/AppError'
import type { CreateBookingInput } from '../../schemas/bookings'

export async function createBooking(userId: string, input: CreateBookingInput) {
  // Vérifier que l'événement existe et a des places disponibles
  const event = await db.query.events.findFirst({ where: eq(events.id, input.eventId) })
  if (!event) throw AppError.notFound('Événement introuvable')
  if (event.availableSeats <= 0) throw AppError.badRequest('Plus de places disponibles')

  // Vérifier que l'utilisateur n'a pas déjà une réservation confirmée pour cet événement
  const existing = await db.query.bookings.findFirst({
    where: and(
      eq(bookings.userId, userId),
      eq(bookings.eventId, input.eventId),
      eq(bookings.status, 'confirmed'),
    ),
  })
  if (existing) throw AppError.conflict('Vous avez déjà une réservation pour cet événement')

  // Décrémenter les places disponibles
  await db
    .update(events)
    .set({ availableSeats: event.availableSeats - 1, updatedAt: new Date() })
    .where(eq(events.id, input.eventId))

  // Créer la réservation
  const [booking] = await db
    .insert(bookings)
    .values({ userId, eventId: input.eventId })
    .returning()

  return booking
}

export async function listUserBookings(userId: string) {
  return db.query.bookings.findMany({
    where: eq(bookings.userId, userId),
    with: { event: true },
    orderBy: (b, { desc }) => [desc(b.bookedAt)],
  })
}

export async function cancelBooking(userId: string, bookingId: string) {
  const booking = await db.query.bookings.findFirst({
    where: and(eq(bookings.id, bookingId), eq(bookings.userId, userId)),
  })
  if (!booking) throw AppError.notFound('Réservation introuvable')
  if (booking.status === 'cancelled') throw AppError.badRequest('Réservation déjà annulée')

  // Remettre la place disponible
  const event = await db.query.events.findFirst({ where: eq(events.id, booking.eventId) })
  if (event) {
    await db
      .update(events)
      .set({ availableSeats: event.availableSeats + 1, updatedAt: new Date() })
      .where(eq(events.id, booking.eventId))
  }

  const [updated] = await db
    .update(bookings)
    .set({ status: 'cancelled' })
    .where(eq(bookings.id, bookingId))
    .returning()

  return updated
}
