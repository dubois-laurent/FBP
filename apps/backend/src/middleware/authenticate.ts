import { type Request, type Response, type NextFunction } from 'express'
import { verifyAccessToken } from '../lib/jwt'
import type { AuthUser } from '../types/auth'

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Token manquant ou malformé' })
    return
  }

  const token = authHeader.slice(7)

  try {
    const payload = verifyAccessToken(token)
    const user: AuthUser = { id: payload.sub, email: payload.email, role: payload.role }
    req.user = user
    next()
  } catch {
    res.status(401).json({ success: false, error: 'Token invalide ou expiré' })
  }
}
