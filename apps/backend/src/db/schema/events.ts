import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  pgEnum,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { bookings } from './bookings'

// L'énumération pour le type d'événement peut être soit "exposition", "conference", "atelier" ou "rencontre"
export const eventTypeEnum = pgEnum('event_type', [
  'exposition',
  'conference',
  'atelier',
  'rencontre',
])

// Table "events" => table "bookings" (relation 1:N)
export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  date: timestamp('date').notNull(),
  venue: varchar('venue', { length: 255 }).notNull(),
  totalSeats: integer('total_seats').notNull(),
  availableSeats: integer('available_seats').notNull(),
  imageUrl: varchar('image_url', { length: 500 }),
  type: eventTypeEnum('type').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const eventsRelations = relations(events, ({ many }) => ({
  bookings: many(bookings),
}))

export type Event = typeof events.$inferSelect
export type NewEvent = typeof events.$inferInsert
