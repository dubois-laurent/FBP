import { or, and, eq } from 'drizzle-orm'
import { db } from '../../config/db'
import { messages } from '../../db/schema'

export async function getConversation(userId: string, otherUserId: string, page = 1, limit = 20) {
  const offset = (page - 1) * limit

  const rows = await db.query.messages.findMany({
    where: or(
      and(eq(messages.senderId, userId), eq(messages.receiverId, otherUserId)),
      and(eq(messages.senderId, otherUserId), eq(messages.receiverId, userId)),
    ),
    limit,
    offset,
    orderBy: (m, { asc }) => [asc(m.sentAt)],
  })

  return rows
}

export async function createMessage(senderId: string, receiverId: string, content: string) {
  const [message] = await db
    .insert(messages)
    .values({ senderId, receiverId, content })
    .returning()
  return message
}