import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { db } from '../../config/db'
import { users } from '../../db/schema'
import { AppError } from '../../lib/AppError'
import type { RegisterInput, LoginInput } from '../../schemas/auth'
import type { AuthUser } from '../../types/auth'


export async function createUser(input: RegisterInput): Promise<{
  id: string; name: string; email: string; role: 'user' | 'admin'
}> {
  const existing = await db.query.users.findFirst({ where: eq(users.email, input.email) })
  if (existing) throw AppError.conflict('Un compte avec cet email existe déjà')

  const hashedPassword = await bcrypt.hash(input.password, 12)
  const [user] = await db
    .insert(users)
    .values({ name: input.name, email: input.email, password: hashedPassword })
    .returning({ id: users.id, name: users.name, email: users.email, role: users.role })

  return user
}


export async function validateCredentials(
  input: LoginInput,
): Promise<{ id: string; name: string; email: string; role: 'user' | 'admin' }> {
  const user = await db.query.users.findFirst({ where: eq(users.email, input.email) })

  if (!user || !user.password) {
    throw AppError.unauthorized('Email ou mot de passe incorrect')
  }

  const valid = await bcrypt.compare(input.password, user.password)
  if (!valid) {
    throw AppError.unauthorized('Email ou mot de passe incorrect')
  }

  return { id: user.id, name: user.name, email: user.email, role: user.role }
}


export async function findOrCreateGoogleUser(profile: {
  googleId: string
  email: string
  displayName: string
}): Promise<AuthUser> {
  let user = await db.query.users.findFirst({ where: eq(users.googleId, profile.googleId) })

  if (!user) {
    user = await db.query.users.findFirst({ where: eq(users.email, profile.email) })
  }

  if (user) {
    if (!user.googleId) {
      await db.update(users).set({ googleId: profile.googleId }).where(eq(users.id, user.id))
    }
  } else {
    const [created] = await db
      .insert(users)
      .values({ name: profile.displayName, email: profile.email, googleId: profile.googleId, password: null })
      .returning()
    user = created
  }

  return { id: user.id, email: user.email, role: user.role }
}


export async function findUserById(id: string) {
  const user = await db.query.users.findFirst({ where: eq(users.id, id) })
  if (!user) throw AppError.notFound('Utilisateur introuvable')
  return user
}
