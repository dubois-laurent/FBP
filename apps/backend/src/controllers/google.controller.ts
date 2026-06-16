import { type Request, type Response } from 'express'
import { signAccessToken, signRefreshToken } from '../lib/jwt'
import { env } from '../config/env'
import type { AuthUser } from '../types/auth'

// Appelé par Passport après authentification Google réussie.
// Génère les tokens JWT et redirige vers le frontend.
export function googleCallback(req: Request, res: Response): void {
  const user = req.user as AuthUser

  const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role })
  const refreshToken = signRefreshToken(user.id)

  // Redirection vers le frontend avec les tokens en query params
  // Le frontend les récupère, les stocke et supprime l'URL sensible de l'historique
  const redirectUrl = new URL('/auth/callback', env.FRONTEND_URL)
  redirectUrl.searchParams.set('accessToken', accessToken)
  redirectUrl.searchParams.set('refreshToken', refreshToken)

  res.redirect(redirectUrl.toString())
}

export function googleFailure(_req: Request, res: Response): void {
  const redirectUrl = new URL('/login', env.FRONTEND_URL)
  redirectUrl.searchParams.set('error', 'google_auth_failed')
  res.redirect(redirectUrl.toString())
}
