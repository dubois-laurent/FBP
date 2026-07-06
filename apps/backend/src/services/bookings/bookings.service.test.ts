import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createBooking, listUserBookings, cancelBooking } from './bookings.service'
import { db } from '../../config/db'

const mockDb = db as unknown as {
  query: {
    events: { findFirst: ReturnType<typeof vi.fn> }
    bookings: { findFirst: ReturnType<typeof vi.fn>; findMany: ReturnType<typeof vi.fn> }
  }
  insert: ReturnType<typeof vi.fn>
  update: ReturnType<typeof vi.fn>
}

const fakeEvent = {
  id: 'uuid-evt-1',
  title: 'Exposition Photo',
  availableSeats: 10,
  totalSeats: 100,
}

const fakeBooking = {
  id: 'uuid-book-1',
  userId: 'uuid-user-1',
  eventId: 'uuid-evt-1',
  status: 'confirmed' as const,
  bookedAt: new Date(),
}

beforeEach(() => vi.clearAllMocks())

describe('createBooking', () => {
  it('crée une réservation et décrémente les places', async () => {
    mockDb.query.events.findFirst.mockResolvedValue(fakeEvent)
    mockDb.query.bookings.findFirst.mockResolvedValue(null) // pas de doublon
    const updateWhere = vi.fn().mockResolvedValue(undefined)
    const updateSet = vi.fn().mockReturnValue({ where: updateWhere })
    mockDb.update.mockReturnValue({ set: updateSet })
    const returning = vi.fn().mockResolvedValue([fakeBooking])
    const values = vi.fn().mockReturnValue({ returning })
    mockDb.insert.mockReturnValue({ values })

    const result = await createBooking('uuid-user-1', { eventId: 'uuid-evt-1' })
    expect(result.status).toBe('confirmed')
  })

  it("lève 404 si l'événement n'existe pas", async () => {
    mockDb.query.events.findFirst.mockResolvedValue(null)
    await expect(createBooking('uuid-user-1', { eventId: 'uuid-fantome' }))
      .rejects.toMatchObject({ statusCode: 404 })
  })

  it('lève 400 si plus de places disponibles', async () => {
    mockDb.query.events.findFirst.mockResolvedValue({ ...fakeEvent, availableSeats: 0 })
    await expect(createBooking('uuid-user-1', { eventId: 'uuid-evt-1' }))
      .rejects.toMatchObject({ statusCode: 400 })
  })

  it('lève 409 si réservation déjà existante', async () => {
    mockDb.query.events.findFirst.mockResolvedValue(fakeEvent)
    mockDb.query.bookings.findFirst.mockResolvedValue(fakeBooking)
    await expect(createBooking('uuid-user-1', { eventId: 'uuid-evt-1' }))
      .rejects.toMatchObject({ statusCode: 409 })
  })
})

describe('listUserBookings', () => {
  it('retourne les réservations de l\'utilisateur', async () => {
    mockDb.query.bookings.findMany.mockResolvedValue([fakeBooking])
    const result = await listUserBookings('uuid-user-1')
    expect(result).toHaveLength(1)
  })
})

describe('cancelBooking', () => {
  it('annule une réservation et remet la place', async () => {
    mockDb.query.bookings.findFirst.mockResolvedValueOnce(fakeBooking)
    mockDb.query.events.findFirst.mockResolvedValue(fakeEvent)
    const updateWhere = vi.fn().mockResolvedValue(undefined)
    const updateSet = vi.fn().mockReturnValue({ where: updateWhere })
    const cancelWhere = vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([{ ...fakeBooking, status: 'cancelled' }]) })
    const cancelSet = vi.fn().mockReturnValue({ where: cancelWhere })
    mockDb.update
      .mockReturnValueOnce({ set: updateSet })   // mise à jour des places
      .mockReturnValueOnce({ set: cancelSet })    // annulation du booking

    const result = await cancelBooking('uuid-user-1', 'uuid-book-1')
    expect(result.status).toBe('cancelled')
  })

  it('lève 404 si la réservation est introuvable', async () => {
    mockDb.query.bookings.findFirst.mockResolvedValue(null)
    await expect(cancelBooking('uuid-user-1', 'uuid-fantome'))
      .rejects.toMatchObject({ statusCode: 404 })
  })

  it('lève 400 si déjà annulée', async () => {
    mockDb.query.bookings.findFirst.mockResolvedValue({ ...fakeBooking, status: 'cancelled' })
    await expect(cancelBooking('uuid-user-1', 'uuid-book-1'))
      .rejects.toMatchObject({ statusCode: 400 })
  })
})
