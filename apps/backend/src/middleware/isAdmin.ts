import { type Request, type Response, type NextFunction } from 'express'

export function isAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ success: false, error: 'Accès réservé aux administrateurs' })
    return
  }
  next()
}
