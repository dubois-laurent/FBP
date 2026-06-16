import { Router } from 'express'
import { authenticate, isAdmin } from '../../middleware'
import { asyncHandler } from '../../lib/asyncHandler'
import {
  listEventsHandler,
  getEventHandler,
  createEventHandler,
  updateEventHandler,
  deleteEventHandler,
} from '../../controllers/events.controller'

const router: Router = Router()

router.get('/', asyncHandler(listEventsHandler))
router.get('/:id', asyncHandler(getEventHandler))
router.post('/', authenticate, isAdmin, asyncHandler(createEventHandler))
router.patch('/:id', authenticate, isAdmin, asyncHandler(updateEventHandler))
router.delete('/:id', authenticate, isAdmin, asyncHandler(deleteEventHandler))

export default router
