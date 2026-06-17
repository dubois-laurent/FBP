import { Router } from 'express'
import { authenticate } from '../../middleware'
import { asyncHandler } from '../../lib/asyncHandler'
import { getConversationHandler } from '../../controllers/messages.controller'

const router: Router = Router()

router.get('/:userId', authenticate, asyncHandler(getConversationHandler))

export default router
