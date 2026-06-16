import { Router } from 'express'
import passport from '../../config/passport'
import { register, login, refresh, logout } from '../../controllers/auth.controller'
import { googleCallback, googleFailure } from '../../controllers/google.controller'

const router: Router = Router()

// ─── JWT auth ─────────────────────────────────────────────────────────────────
router.post('/register', register)
router.post('/login', login)
router.post('/refresh', refresh)
router.post('/logout', logout)

// ─── Google OAuth2 ────────────────────────────────────────────────────────────
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false }),
)

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/auth/google/failure' }),
  googleCallback,
)

router.get('/google/failure', googleFailure)

export default router
