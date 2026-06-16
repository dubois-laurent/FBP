import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { bookings } from './bookings'

// L'énumération pour le rôle d'utilisateur peut être soit "user" (utilisateur) soit "admin" (administrateur)
export const roleEnum = pgEnum('role', ['user', 'admin'])


// Table "users" => table "bookings" (relation 1:N)
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 60 }), // bcrypt output = toujours 60 charactères peu importe l'input (merci Dany). Nullable pour les utilisateurs Google OAuth
  role: roleEnum('role').notNull().default('user'),
  googleId: varchar('google_id', { length: 255 }).unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
}))

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
