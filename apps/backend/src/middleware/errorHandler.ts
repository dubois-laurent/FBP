import { type Request, type Response, type NextFunction } from 'express'
import { AppError } from '../lib/AppError'
import { env } from '../config/env'

// Signature à 4 paramètres obligatoire pour qu'Express reconnaisse ce middleware comme error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  // Erreur applicative typée
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code,
      ...(err.details !== undefined && { details: err.details }),
    })
    return
  }

  // Erreur inattendue — ne pas exposer le détail en production
  const isProduction = env.NODE_ENV === 'production'

  console.error('[Unhandled error]', err)

  res.status(500).json({
    success: false,
    error: 'Erreur interne du serveur',
    ...(!isProduction && { details: err instanceof Error ? err.message : String(err) }),
  })
}
