import { type Request, type Response } from 'express'
import {
  listEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../services/events/events.service'
import { createEventSchema, updateEventSchema, eventsQuerySchema } from '../schemas/events'
import { AppError } from '../lib/AppError'

export async function listEventsHandler(req: Request, res: Response){
  const parsed = eventsQuerySchema.safeParse(req.query)
  if (!parsed.success) throw AppError.badRequest('Paramètres invalides', parsed.error.flatten())
  const result = await listEvents(parsed.data)
  res.json({ success: true, ...result })
}

export async function getEventHandler(req: Request, res: Response){
  const event = await getEventById(req.params['id'] as string)
  res.json({ success: true, data: event })
}

export async function createEventHandler(req: Request, res: Response){
  const parsed = createEventSchema.safeParse(req.body)
  if (!parsed.success) throw AppError.badRequest('Données invalides', parsed.error.flatten())
  const event = await createEvent(parsed.data)
  res.status(201).json({ success: true, data: event, message: 'Événement créé' })
}

export async function updateEventHandler(req: Request, res: Response){
  const parsed = updateEventSchema.safeParse(req.body)
  if (!parsed.success) throw AppError.badRequest('Données invalides', parsed.error.flatten())
  const event = await updateEvent(req.params['id'] as string, parsed.data)
  res.json({ success: true, data: event, message: 'Événement mis à jour' })
}

export async function deleteEventHandler(req: Request, res: Response){
  await deleteEvent(req.params['id'] as string)
  res.json({ success: true, message: 'Événement supprimé' })
}
