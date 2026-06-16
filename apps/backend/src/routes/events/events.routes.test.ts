import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'
import eventsRouter from './events.routes'
import { errorHandler } from '../../middleware'
import { db } from '../../config/db'
import { signAccessToken } from '../../lib/jwt'

const app = express()
app.use(express.json())
app.use('/events', eventsRouter)
app.use(errorHandler)

const mockDb = db as unknown as {
  query: { events: { findFirst: ReturnType<typeof vi.fn>; findMany: ReturnType<typeof vi.fn> } }
  insert: ReturnType<typeof vi.fn>
  update: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
  select: ReturnType<typeof vi.fn>
}

const userToken = signAccessToken({ sub: 'uuid-1', email: 'user@test.com', role: 'user' })
const adminToken = signAccessToken({ sub: 'uuid-2', email: 'admin@test.com', role: 'admin' })

const fakeEvent = {
  id: 'uuid-evt-1',
  title: 'Exposition Photo',
  description: 'Une belle exposition de photographie',
  date: new Date('2026-07-01T10:00:00Z'),
  venue: 'Paris',
  totalSeats: 100,
  availableSeats: 100,
  imageUrl: null,
  type: 'exposition',
  createdAt: new Date(),
  updatedAt: new Date(),
}

beforeEach(() => vi.clearAllMocks())

// ─── GET /events ──────────────────────────────────────────────────────────────
describe('GET /events', () => {
  it('retourne la liste des événements sans authentification (200)', async () => {
    mockDb.query.events.findMany.mockResolvedValue([fakeEvent])
    const whereFn = vi.fn().mockResolvedValue([{ count: 1 }])
    const fromFn = vi.fn().mockReturnValue({ where: whereFn })
    mockDb.select.mockReturnValue({ from: fromFn })

    const res = await request(app).get('/events')
    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.meta).toHaveProperty('total')
  })

  it('retourne 400 si les query params sont invalides', async () => {
    const res = await request(app).get('/events?type=invalide')
    expect(res.status).toBe(400)
  })
})

// ─── GET /events/:id ──────────────────────────────────────────────────────────
describe('GET /events/:id', () => {
  it('retourne l\'événement (200)', async () => {
    mockDb.query.events.findFirst.mockResolvedValue(fakeEvent)
    const res = await request(app).get('/events/uuid-evt-1')
    expect(res.status).toBe(200)
    expect(res.body.data.title).toBe('Exposition Photo')
  })

  it('retourne 404 si introuvable', async () => {
    mockDb.query.events.findFirst.mockResolvedValue(null)
    const res = await request(app).get('/events/uuid-fantome')
    expect(res.status).toBe(404)
  })
})

// ─── POST /events ─────────────────────────────────────────────────────────────
describe('POST /events', () => {
  const validBody = {
    title: 'Nouvelle expo',
    description: 'Une description suffisamment longue',
    date: '2026-08-01T10:00:00Z',
    venue: 'Lyon',
    totalSeats: 50,
    type: 'exposition',
  }

  it('crée un événement si admin (201)', async () => {
    const returning = vi.fn().mockResolvedValue([{ ...fakeEvent, ...validBody }])
    const values = vi.fn().mockReturnValue({ returning })
    mockDb.insert.mockReturnValue({ values })

    const res = await request(app)
      .post('/events')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(validBody)
    expect(res.status).toBe(201)
    expect(res.body.data.title).toBe('Nouvelle expo')
  })

  it('retourne 403 pour un utilisateur non-admin', async () => {
    const res = await request(app)
      .post('/events')
      .set('Authorization', `Bearer ${userToken}`)
      .send(validBody)
    expect(res.status).toBe(403)
  })

  it('retourne 401 sans token', async () => {
    const res = await request(app).post('/events').send(validBody)
    expect(res.status).toBe(401)
  })

  it('retourne 400 si le body est invalide', async () => {
    const res = await request(app)
      .post('/events')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'X' }) // manque des champs requis
    expect(res.status).toBe(400)
  })
})

// ─── PATCH /events/:id ────────────────────────────────────────────────────────
describe('PATCH /events/:id', () => {
  it('met à jour un événement si admin (200)', async () => {
    mockDb.query.events.findFirst.mockResolvedValue(fakeEvent)
    const returning = vi.fn().mockResolvedValue([{ ...fakeEvent, title: 'Titre modifié' }])
    const where = vi.fn().mockReturnValue({ returning })
    const set = vi.fn().mockReturnValue({ where })
    mockDb.update.mockReturnValue({ set })

    const res = await request(app)
      .patch('/events/uuid-evt-1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Titre modifié' })
    expect(res.status).toBe(200)
    expect(res.body.data.title).toBe('Titre modifié')
  })

  it('retourne 403 pour un utilisateur non-admin', async () => {
    const res = await request(app)
      .patch('/events/uuid-evt-1')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'X' })
    expect(res.status).toBe(403)
  })
})

// ─── DELETE /events/:id ───────────────────────────────────────────────────────
describe('DELETE /events/:id', () => {
  it('supprime un événement si admin (200)', async () => {
    mockDb.query.events.findFirst.mockResolvedValue(fakeEvent)
    const where = vi.fn().mockResolvedValue(undefined)
    mockDb.delete.mockReturnValue({ where })

    const res = await request(app)
      .delete('/events/uuid-evt-1')
      .set('Authorization', `Bearer ${adminToken}`)
    expect(res.status).toBe(200)
    expect(res.body.message).toBe('Événement supprimé')
  })

  it('retourne 403 pour un utilisateur non-admin', async () => {
    const res = await request(app)
      .delete('/events/uuid-evt-1')
      .set('Authorization', `Bearer ${userToken}`)
    expect(res.status).toBe(403)
  })

  it('retourne 404 si l\'événement n\'existe pas', async () => {
    mockDb.query.events.findFirst.mockResolvedValue(null)
    const res = await request(app)
      .delete('/events/uuid-fantome')
      .set('Authorization', `Bearer ${adminToken}`)
    expect(res.status).toBe(404)
  })
})
