import { type Request, type Response } from 'express'
import { createBooking, listUserBookings, cancelBooking } from '../services/bookings/bookings.service'
import { createBookingSchema } from '../schemas/bookings'
import { AppError } from '../lib/AppError'

export async function createBookingHandler(req: Request, res: Response){
  const parsed = createBookingSchema.safeParse(req.body)
  if (!parsed.success) throw AppError.badRequest('Données invalides', parsed.error.flatten())
  const booking = await createBooking(req.user!.id, parsed.data)
  res.status(201).json({ success: true, data: booking, message: 'Réservation confirmée' })
}

export async function listBookingsHandler(req: Request, res: Response){
  const bookingsList = await listUserBookings(req.user!.id)
  res.json({ success: true, data: bookingsList })
}

export async function cancelBookingHandler(req: Request, res: Response){
  const booking = await cancelBooking(req.user!.id, req.params['id'] as string)
  res.json({ success: true, data: booking, message: 'Réservation annulée' })
}
