import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'
import messagesRouter from './messages.routes'
import { errorHandler } from '../../middleware'
import { db } from '../../config/db'
import { signAccessToken } from '../../lib/jwt'

const app = express()
app.use(express.json())
app.use('/messages', messagesRouter)
app.use(errorHandler)

const mockDb = db as unknown as {
  query: { messages: { findMany: ReturnType<typeof vi.fn> } }
}

const userToken = signAccessToken({ sub: 'uuid-user-1', email: 'user@test.com', role: 'user' })

const fakeMessage = {
  id: 'uuid-msg-1',
  senderId: 'uuid-user-1',
  receiverId: 'uuid-user-2',
  content: 'Bonjour !',
  sentAt: new Date(),
}

beforeEach(() => vi.clearAllMocks())

describe('GET /messages/:userId', () => {
  it('retourne la conversation (200) si authentifié', async () => {
    mockDb.query.messages.findMany.mockResolvedValue([fakeMessage])

    const res = await request(app)
      .get('/messages/uuid-user-2')
      .set('Authorization', `Bearer ${userToken}`)

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.data[0].content).toBe('Bonjour !')
  })

  it('retourne 401 sans token', async () => {
    const res = await request(app).get('/messages/uuid-user-2')
    expect(res.status).toBe(401)
  })

  it('retourne 400 si les query params sont invalides', async () => {
    const res = await request(app)
      .get('/messages/uuid-user-2?page=-1')
      .set('Authorization', `Bearer ${userToken}`)
    expect(res.status).toBe(400)
  })
})
