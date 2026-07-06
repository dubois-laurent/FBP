import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { db } from '../../config/db'
import { users } from '../../db/schema'
import { AppError } from '../../lib/AppError'
import type { UpdateUserInput } from '../../schemas/users'

export async function getUserById(id: string) {
  const user = await db.query.users.findFirst({ where: eq(users.id, id) })
  if (!user) throw AppError.notFound('Utilisateur introuvable')
  return user
}

export async function updateUser(id: string, input: UpdateUserInput) {
  const data: Record<string, unknown> = {}

  if (input.name) data.name = input.name
  if (input.password) data.password = await bcrypt.hash(input.password, 12)
  data.updatedAt = new Date()

  const [updated] = await db
    .update(users)
    .set(data)
    .where(eq(users.id, id))
    .returning({ id: users.id, name: users.name, email: users.email, role: users.role, updatedAt: users.updatedAt })

  return updated
}
