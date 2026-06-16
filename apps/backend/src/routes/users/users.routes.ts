import { Router } from 'express'
import { getOneUser, putOneUser } from '../../controllers/users.controller'
import { authenticate } from '../../middleware'
import { asyncHandler } from '../../lib/asyncHandler'

const router: Router = Router()

router.get('/user', authenticate, asyncHandler(getOneUser))
router.put('/user', authenticate, asyncHandler(putOneUser))

export default router
