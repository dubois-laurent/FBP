import { Router } from 'express'
import passport from '../../config/passport'
import { register, login, refresh, logout } from '../../controllers/auth.controller'
import { googleCallback, googleFailure } from '../../controllers/google.controller'
import { asyncHandler } from '../../lib/asyncHandler'

const router: Router = Router()

router.post('/register', asyncHandler(register))
router.post('/login', asyncHandler(login))
router.post('/refresh', asyncHandler(refresh))
router.post('/logout', logout)

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
