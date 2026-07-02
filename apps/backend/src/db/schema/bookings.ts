import {
  pgTable,
  uuid,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './users'
import { events } from './events'


// Je définis ici l'énumération pour le statut de réservation, qui peut être soit "confirmed" (confirmé) soit "cancelled" (annulé)
export const bookingStatusEnum = pgEnum('booking_status', [
  'confirmed',
  'cancelled',
])


// Je définis ici la table "bookings" avec les colonnes et les relations avec "users" et "events" en one-to-many (1:N)

export const bookings = pgTable('bookings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  eventId: uuid('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  status: bookingStatusEnum('status').notNull().default('confirmed'),
  bookedAt: timestamp('booked_at').notNull().defaultNow(),
})

export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  event: one(events, {
    fields: [bookings.eventId],
    references: [events.id],
  }),
}))

export type Booking = typeof bookings.$inferSelect
export type NewBooking = typeof bookings.$inferInsert
