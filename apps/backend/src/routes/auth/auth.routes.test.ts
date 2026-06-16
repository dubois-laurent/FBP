import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'
import authRouter from './auth.routes'
import { errorHandler } from '../../middleware'
import { db } from '../../config/db'

const app = express()
app.use(express.json())
app.use('/auth', authRouter)
app.use(errorHandler) // indispensable pour que AppError → réponse JSON

const mockDb = db as unknown as {
  query: { users: { findFirst: ReturnType<typeof vi.fn> } }
  insert: ReturnType<typeof vi.fn>
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('POST /auth/register', () => {
  it('crée un utilisateur et retourne les tokens (201)', async () => {
    mockDb.query.users.findFirst.mockResolvedValue(null) // pas de doublon

    const returning = vi.fn().mockResolvedValue([{
      id: 'uuid-123',
      name: 'Alice',
      email: 'alice@test.com',
      role: 'user',
    }])
    const values = vi.fn().mockReturnValue({ returning })
    mockDb.insert.mockReturnValue({ values })

    const res = await request(app).post('/auth/register').send({
      name: 'Alice',
      email: 'alice@test.com',
      password: 'password123',
    })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveProperty('accessToken')
    expect(res.body.data).toHaveProperty('refreshToken')
    expect(res.body.data.user.email).toBe('alice@test.com')
  })

  it('retourne 409 si l\'email est déjà utilisé', async () => {
    mockDb.query.users.findFirst.mockResolvedValue({ id: 'existing', email: 'alice@test.com' })

    const res = await request(app).post('/auth/register').send({
      name: 'Alice',
      email: 'alice@test.com',
      password: 'password123',
    })

    expect(res.status).toBe(409)
    expect(res.body.success).toBe(false)
  })

  it('retourne 400 si les données sont invalides', async () => {
    const res = await request(app).post('/auth/register').send({
      email: 'pas-un-email',
      password: 'court',
    })

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })
})

describe('POST /auth/login', () => {
  it('retourne les tokens pour des identifiants valides (200)', async () => {
    const bcrypt = await import('bcryptjs')
    const hashedPassword = await bcrypt.hash('password123', 12)

    mockDb.query.users.findFirst.mockResolvedValue({
      id: 'uuid-123',
      name: 'Alice',
      email: 'alice@test.com',
      password: hashedPassword,
      role: 'user',
    })

    const res = await request(app).post('/auth/login').send({
      email: 'alice@test.com',
      password: 'password123',
    })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveProperty('accessToken')
    expect(res.body.data).toHaveProperty('refreshToken')
  })

  it('retourne 401 si le mot de passe est incorrect', async () => {
    const bcrypt = await import('bcryptjs')
    const hashedPassword = await bcrypt.hash('autrepassword', 12)

    mockDb.query.users.findFirst.mockResolvedValue({
      id: 'uuid-123',
      email: 'alice@test.com',
      password: hashedPassword,
      role: 'user',
    })

    const res = await request(app).post('/auth/login').send({
      email: 'alice@test.com',
      password: 'mauvaispassword',
    })

    expect(res.status).toBe(401)
    expect(res.body.success).toBe(false)
  })

  it('retourne 401 si l\'utilisateur n\'existe pas', async () => {
    mockDb.query.users.findFirst.mockResolvedValue(null)

    const res = await request(app).post('/auth/login').send({
      email: 'inconnu@test.com',
      password: 'password123',
    })

    expect(res.status).toBe(401)
    expect(res.body.success).toBe(false)
  })
})

describe('POST /auth/refresh', () => {
  it('retourne un nouveau accessToken avec un refreshToken valide', async () => {
    const { signRefreshToken } = await import('../../lib/jwt')
    const refreshToken = signRefreshToken('uuid-123')

    mockDb.query.users.findFirst.mockResolvedValue({
      id: 'uuid-123',
      email: 'alice@test.com',
      role: 'user',
    })

    const res = await request(app).post('/auth/refresh').send({ refreshToken })

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveProperty('accessToken')
    expect(res.body.data).toHaveProperty('refreshToken')
  })

  it('retourne 401 avec un refreshToken invalide', async () => {
    const res = await request(app).post('/auth/refresh').send({ refreshToken: 'token.invalide' })

    expect(res.status).toBe(401)
    expect(res.body.success).toBe(false)
  })
})
