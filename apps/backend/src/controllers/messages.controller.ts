import { type Request, type Response } from 'express'
import { getConversation } from '../services/messages/messages.service'
import { conversationQuerySchema } from '../schemas/messages'
import { AppError } from '../lib/AppError'

export async function getConversationHandler(req: Request, res: Response){
  const parsed = conversationQuerySchema.safeParse(req.query)
  if (!parsed.success) throw AppError.badRequest('Paramètres invalides', parsed.error.flatten())

  const userId = req.user!.id
  const otherUserId = req.params['userId'] as string
  const { page, limit } = parsed.data

  const rows = await getConversation(userId, otherUserId, page, limit)
  res.json({ success: true, data: rows, meta: { page, limit } })
}
