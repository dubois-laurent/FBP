import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'
import usersRouter from './users.routes'
import { errorHandler } from '../../middleware'
import { db } from '../../config/db'
import { signAccessToken } from '../../lib/jwt'

const app = express()
app.use(express.json())
app.use('/users', usersRouter)
app.use(errorHandler)

const mockDb = db as unknown as {
  query: { users: { findFirst: ReturnType<typeof vi.fn> } }
  update: ReturnType<typeof vi.fn>
}

// Token valide pour les tests protégés
const validToken = signAccessToken({ sub: 'uuid-1', email: 'alice@test.com', role: 'user' })
const authHeader = { Authorization: `Bearer ${validToken}` }

beforeEach(() => vi.clearAllMocks())

describe('GET /users/user', () => {
  it('retourne le profil de l\'utilisateur connecté (200)', async () => {
    mockDb.query.users.findFirst.mockResolvedValue({
      id: 'uuid-1', name: 'Alice', email: 'alice@test.com',
      role: 'user', password: 'hashed', googleId: null,
      createdAt: new Date(), updatedAt: new Date(),
    })

    const res = await request(app).get('/users/user').set(authHeader)

    expect(res.status).toBe(200)
    expect(res.body.data.email).toBe('alice@test.com')
    expect(res.body.data).not.toHaveProperty('password')
    expect(res.body.data).not.toHaveProperty('googleId')
  })

  it('retourne 401 sans token', async () => {
    const res = await request(app).get('/users/user')
    expect(res.status).toBe(401)
  })
})

describe('PATCH /users/user', () => {
  it('met à jour le profil (200)', async () => {
    const returning = vi.fn().mockResolvedValue([{
      id: 'uuid-1', name: 'Alice Modifiée', email: 'alice@test.com', role: 'user',
    }])
    const where = vi.fn().mockReturnValue({ returning })
    const set = vi.fn().mockReturnValue({ where })
    mockDb.update.mockReturnValue({ set })

    const res = await request(app)
      .patch('/users/user')
      .set(authHeader)
      .send({ name: 'Alice Modifiée' })

    expect(res.status).toBe(200)
    expect(res.body.data.name).toBe('Alice Modifiée')
  })

  it('retourne 400 si le nom est trop court', async () => {
    const res = await request(app)
      .patch('/users/user')
      .set(authHeader)
      .send({ name: 'A' })

    expect(res.status).toBe(400)
  })

  it('retourne 401 sans token', async () => {
    const res = await request(app).patch('/users/user').send({ name: 'Alice' })
    expect(res.status).toBe(401)
  })
})
