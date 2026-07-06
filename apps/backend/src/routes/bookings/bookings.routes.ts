import { Router } from 'express'
import { authenticate } from '../../middleware'
import { asyncHandler } from '../../lib/asyncHandler'
import {
  createBookingHandler,
  listBookingsHandler,
  cancelBookingHandler,
} from '../../controllers/bookings.controller'

const router: Router = Router()

/**
 * @swagger
 * /bookings:
 *   post:
 *     tags: [bookings]
 *     summary: Réserver un événement
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [eventId]
 *             properties:
 *               eventId:
 *                 type: string
 *                 format: uuid
 *                 example: 550e8400-e29b-41d4-a716-446655440000
 *     responses:
 *       201:
 *         description: Réservation créée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Plus de places disponibles ou données invalides
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
 *       404:
 *         description: Événement introuvable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Réservation déjà existante pour cet événement
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', authenticate, asyncHandler(createBookingHandler))

/**
 * @swagger
 * /bookings:
 *   get:
 *     tags: [bookings]
 *     summary: Lister ses réservations
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des réservations de l'utilisateur (avec détail de l'événement)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Booking'
 *                       - type: object
 *                         properties:
 *                           event:
 *                             $ref: '#/components/schemas/Event'
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', authenticate, asyncHandler(listBookingsHandler))

/**
 * @swagger
 * /bookings/{id}/cancel:
 *   patch:
 *     tags: [bookings]
 *     summary: Annuler une réservation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Réservation annulée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Réservation déjà annulée
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
 *       404:
 *         description: Réservation introuvable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch('/:id/cancel', authenticate, asyncHandler(cancelBookingHandler))

export default router
