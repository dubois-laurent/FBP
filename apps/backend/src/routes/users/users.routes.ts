import { Router } from 'express'
import { getOneUser, putOneUser } from '../../controllers/users.controller'
import { authenticate } from '../../middleware'
import { asyncHandler } from '../../lib/asyncHandler'

const router: Router = Router()

/**
 * @swagger
 * /users/user:
 *   get:
 *     tags: [users]
 *     summary: Récupérer son profil
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil de l'utilisateur connecté
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/user', authenticate, asyncHandler(getOneUser))

/**
 * @swagger
 * /users/user:
 *   patch:
 *     tags: [users]
 *     summary: Modifier son profil
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Jean Dupont
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: nouveaumotdepasse
 *     responses:
 *       200:
 *         description: Profil mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch('/user', authenticate, asyncHandler(putOneUser))

export default router
