import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'
import bookingsRouter from './bookings.routes'
import { errorHandler } from '../../middleware'
import { db } from '../../config/db'
import { signAccessToken } from '../../lib/jwt'

const app = express()
app.use(express.json())
app.use('/bookings', bookingsRouter)
app.use(errorHandler)

const mockDb = db as unknown as {
  query: {
    events: { findFirst: ReturnType<typeof vi.fn> }
    bookings: { findFirst: ReturnType<typeof vi.fn>; findMany: ReturnType<typeof vi.fn> }
  }
  insert: ReturnType<typeof vi.fn>
  update: ReturnType<typeof vi.fn>
}

const userToken = signAccessToken({ sub: 'uuid-user-1', email: 'user@test.com', role: 'user' })

const EVENT_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
const BOOKING_ID = 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'

const fakeEvent = { id: EVENT_ID, title: 'Expo', availableSeats: 10, totalSeats: 100 }
const fakeBooking = {
  id: BOOKING_ID, userId: 'uuid-user-1', eventId: EVENT_ID,
  status: 'confirmed', bookedAt: new Date(),
}

beforeEach(() => vi.clearAllMocks())

describe('POST /bookings', () => {
  it('crée une réservation (201)', async () => {
    mockDb.query.events.findFirst.mockResolvedValue(fakeEvent)
    mockDb.query.bookings.findFirst.mockResolvedValue(null)
    const updateWhere = vi.fn().mockResolvedValue(undefined)
    mockDb.update.mockReturnValue({ set: vi.fn().mockReturnValue({ where: updateWhere }) })
    const returning = vi.fn().mockResolvedValue([fakeBooking])
    mockDb.insert.mockReturnValue({ values: vi.fn().mockReturnValue({ returning }) })

    const res = await request(app)
      .post('/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ eventId: EVENT_ID })

    expect(res.status).toBe(201)
    expect(res.body.data.status).toBe('confirmed')
  })

  it('retourne 401 sans token', async () => {
    const res = await request(app).post('/bookings').send({ eventId: 'uuid-evt-1' })
    expect(res.status).toBe(401)
  })

  it('retourne 400 si eventId manquant', async () => {
    const res = await request(app)
      .post('/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({})
    expect(res.status).toBe(400)
  })

  it('retourne 400 si plus de places', async () => {
    mockDb.query.events.findFirst.mockResolvedValue({ ...fakeEvent, availableSeats: 0 })
    const res = await request(app)
      .post('/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ eventId: EVENT_ID })
    expect(res.status).toBe(400)
  })

  it('retourne 409 si déjà réservé', async () => {
    mockDb.query.events.findFirst.mockResolvedValue(fakeEvent)
    mockDb.query.bookings.findFirst.mockResolvedValue(fakeBooking)
    const res = await request(app)
      .post('/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ eventId: EVENT_ID })
    expect(res.status).toBe(409)
  })
})

describe('GET /bookings', () => {
  it('retourne les réservations de l\'utilisateur (200)', async () => {
    mockDb.query.bookings.findMany.mockResolvedValue([fakeBooking])
    const res = await request(app)
      .get('/bookings')
      .set('Authorization', `Bearer ${userToken}`)
    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(1)
  })

  it('retourne 401 sans token', async () => {
    const res = await request(app).get('/bookings')
    expect(res.status).toBe(401)
  })
})

describe('PATCH /bookings/:id/cancel', () => {
  it('annule une réservation (200)', async () => {
    mockDb.query.bookings.findFirst.mockResolvedValueOnce(fakeBooking)
    mockDb.query.events.findFirst.mockResolvedValue(fakeEvent)
    const updateWhere = vi.fn().mockResolvedValue(undefined)
    const cancelReturning = vi.fn().mockResolvedValue([{ ...fakeBooking, status: 'cancelled' }])
    const cancelWhere = vi.fn().mockReturnValue({ returning: cancelReturning })
    mockDb.update
      .mockReturnValueOnce({ set: vi.fn().mockReturnValue({ where: updateWhere }) })
      .mockReturnValueOnce({ set: vi.fn().mockReturnValue({ where: cancelWhere }) })

    const res = await request(app)
      .patch(`/bookings/${BOOKING_ID}/cancel`)
      .set('Authorization', `Bearer ${userToken}`)
    expect(res.status).toBe(200)
    expect(res.body.data.status).toBe('cancelled')
  })

  it('retourne 404 si réservation introuvable', async () => {
    mockDb.query.bookings.findFirst.mockResolvedValue(null)
    const res = await request(app)
      .patch('/bookings/c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/cancel')
      .set('Authorization', `Bearer ${userToken}`)
    expect(res.status).toBe(404)
  })

  it('retourne 401 sans token', async () => {
    const res = await request(app).patch('/bookings/uuid-book-1/cancel')
    expect(res.status).toBe(401)
  })
})
