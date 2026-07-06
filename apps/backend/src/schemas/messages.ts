import { z } from 'zod'

export const sendMessageSchema = z.object({
  receiverId: z.string().uuid('receiverId doit être un UUID valide'),
  content: z.string().min(1, 'Le message ne peut pas être vide').max(2000),
})

export const conversationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export type SendMessageInput = z.infer<typeof sendMessageSchema>
export type ConversationQuery = z.infer<typeof conversationQuerySchema>
