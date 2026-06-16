import { type Request, type Response } from 'express'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { db } from '../config/db'
import { users } from '../db/schema'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../lib/jwt'
import { registerSchema, loginSchema, refreshSchema } from '../schemas/auth'
import type { ApiResponse } from '../types'


export async function register(req: Request, res: Response): Promise<void> {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ success: false, error: 'Données invalides', details: parsed.error.flatten() })
    return
  }

  const { name, email, password } = parsed.data

  const existing = await db.query.users.findFirst({ where: eq(users.email, email) })
  if (existing) {
    res.status(409).json({ success: false, error: 'Un compte avec cet email existe déjà' })
    return
  }

  const hashedPassword = await bcrypt.hash(password, 12)
  const [user] = await db
    .insert(users)
    .values({ name, email, password: hashedPassword })
    .returning({ id: users.id, name: users.name, email: users.email, role: users.role })

  const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role })
  const refreshToken = signRefreshToken(user.id)

  const response: ApiResponse<{ user: typeof user; accessToken: string; refreshToken: string }> = {
    success: true,
    data: { user, accessToken, refreshToken },
    message: 'Compte créé avec succès',
  }
  res.status(201).json(response)
}

export async function login(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ success: false, error: 'Données invalides', details: parsed.error.flatten() })
    return
  }

  const { email, password } = parsed.data

  const user = await db.query.users.findFirst({ where: eq(users.email, email) })
  if (!user || !user.password) {
    res.status(401).json({ success: false, error: 'Email ou mot de passe incorrect' })
    return
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    res.status(401).json({ success: false, error: 'Email ou mot de passe incorrect' })
    return
  }

  const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role })
  const refreshToken = signRefreshToken(user.id)

  const response: ApiResponse<{ user: { id: string; name: string; email: string; role: string }; accessToken: string; refreshToken: string }> = {
    success: true,
    data: { user: { id: user.id, name: user.name, email: user.email, role: user.role }, accessToken, refreshToken },
  }
  res.json(response)
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const parsed = refreshSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ success: false, error: 'refreshToken manquant' })
    return
  }

  let payload
  try {
    payload = verifyRefreshToken(parsed.data.refreshToken)
  } catch {
    res.status(401).json({ success: false, error: 'Refresh token invalide ou expiré' })
    return
  }

  const user = await db.query.users.findFirst({ where: eq(users.id, payload.sub) })
  if (!user) {
    res.status(401).json({ success: false, error: 'Utilisateur introuvable' })
    return
  }

  const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role })
  const refreshToken = signRefreshToken(user.id)

  res.json({ success: true, data: { accessToken, refreshToken } })
}

export function logout(_req: Request, res: Response): void {
  // Tokens JWT stateless — révocation gérée côté client
  res.json({ success: true, message: 'Déconnexion réussie' })
}
