import { AuthUser } from './auth'

// Augmentation du namespace Express pour typer req.user dans toutes les routes
declare global {
  namespace Express {
    interface User extends AuthUser {}
    interface Request {
      user?: AuthUser
    }
  }
}
