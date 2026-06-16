import { Router } from 'express'
import { authenticate } from '../../middleware'
import { asyncHandler } from '../../lib/asyncHandler'
import {
  createBookingHandler,
  listBookingsHandler,
  cancelBookingHandler,
} from '../../controllers/bookings.controller'

const router: Router = Router()

// Toutes les routes bookings nécessitent d'être authentifié
router.post('/', authenticate, asyncHandler(createBookingHandler))
router.get('/', authenticate, asyncHandler(listBookingsHandler))
router.patch('/:id/cancel', authenticate, asyncHandler(cancelBookingHandler))

export default router
