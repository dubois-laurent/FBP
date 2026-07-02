import { type Request, type Response } from 'express'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../lib/jwt'
import { registerSchema, loginSchema, refreshSchema } from '../schemas/auth'
import { createUser, validateCredentials, findUserById } from '../services/auth/auth.service'
import type { ApiResponse } from '../types'

export async function register(req: Request, res: Response){
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ success: false, error: 'Données invalides', details: parsed.error.flatten() })
    return
  }
  // AppError (ex: conflict 409) propagé via asyncHandler → errorHandler
  const user = await createUser(parsed.data)
  const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role })
  const refreshToken = signRefreshToken(user.id)
  const response: ApiResponse = { success: true, data: { user, accessToken, refreshToken }, message: 'Compte créé avec succès' }
  res.status(201).json(response)
}

export async function login(req: Request, res: Response){
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ success: false, error: 'Données invalides', details: parsed.error.flatten() })
    return
  }
  const user = await validateCredentials(parsed.data)
  const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role })
  const refreshToken = signRefreshToken(user.id)
  res.json({ success: true, data: { user, accessToken, refreshToken } })
}

export async function refresh(req: Request, res: Response){
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
  const user = await findUserById(payload.sub)
  const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role })
  const refreshToken = signRefreshToken(user.id)
  res.json({ success: true, data: { accessToken, refreshToken } })
}

export function logout(_req: Request, res: Response): void {
  res.json({ success: true, message: 'Déconnexion réussie' })
}