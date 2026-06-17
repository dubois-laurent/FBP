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

/**
 * @swagger
 * /events:
 *   get:
 *     tags: [events]
 *     summary: Lister les événements
 *     security: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [exposition, conference, atelier, rencontre]
 *         description: Filtrer par type
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *           example: '2026-07-01'
 *         description: Filtrer par date (YYYY-MM-DD)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *     responses:
 *       200:
 *         description: Liste paginée des événements
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       400:
 *         description: Paramètres invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', asyncHandler(listEventsHandler))

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     tags: [events]
 *     summary: Récupérer un événement
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Détail de l'événement
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/Event'
 *       404:
 *         description: Événement introuvable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', asyncHandler(getEventHandler))

/**
 * @swagger
 * /events:
 *   post:
 *     tags: [events]
 *     summary: Créer un événement (admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, date, venue, totalSeats, type]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Exposition Photo
 *               description:
 *                 type: string
 *                 example: Une belle exposition de photographie contemporaine
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: '2026-07-01T10:00:00Z'
 *               venue:
 *                 type: string
 *                 example: Paris
 *               totalSeats:
 *                 type: integer
 *                 example: 100
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *                 nullable: true
 *               type:
 *                 type: string
 *                 enum: [exposition, conference, atelier, rencontre]
 *     responses:
 *       201:
 *         description: Événement créé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/Event'
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
 *       403:
 *         description: Accès refusé (admin requis)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', authenticate, isAdmin, asyncHandler(createEventHandler))

/**
 * @swagger
 * /events/{id}:
 *   patch:
 *     tags: [events]
 *     summary: Modifier un événement (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               date: { type: string, format: date-time }
 *               venue: { type: string }
 *               totalSeats: { type: integer }
 *               imageUrl: { type: string, nullable: true }
 *               type:
 *                 type: string
 *                 enum: [exposition, conference, atelier, rencontre]
 *     responses:
 *       200:
 *         description: Événement mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/Event'
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Accès refusé (admin requis)
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
 */
router.patch('/:id', authenticate, isAdmin, asyncHandler(updateEventHandler))

/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     tags: [events]
 *     summary: Supprimer un événement (admin)
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
 *         description: Événement supprimé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Événement supprimé }
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Accès refusé (admin requis)
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
 */
router.delete('/:id', authenticate, isAdmin, asyncHandler(deleteEventHandler))

export default router
