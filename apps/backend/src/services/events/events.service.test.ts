import { describe, it, expect, vi, beforeEach } from 'vitest'
import { listEvents, getEventById, createEvent, updateEvent, deleteEvent } from './events.service'
import { db } from '../../config/db'

const mockDb = db as unknown as {
  query: { events: { findFirst: ReturnType<typeof vi.fn>; findMany: ReturnType<typeof vi.fn> } }
  insert: ReturnType<typeof vi.fn>
  update: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
  select: ReturnType<typeof vi.fn>
}

const fakeEvent = {
  id: 'uuid-evt-1',
  title: 'Exposition Photo',
  description: 'Une belle exposition',
  date: new Date('2026-07-01T10:00:00Z'),
  venue: 'Paris',
  totalSeats: 100,
  availableSeats: 100,
  imageUrl: null,
  type: 'exposition' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
}

beforeEach(() => vi.clearAllMocks())

// ─── listEvents ───────────────────────────────────────────────────────────────
describe('listEvents', () => {
  it('retourne la liste paginée des événements', async () => {
    mockDb.query.events.findMany.mockResolvedValue([fakeEvent])
    // mock db.select().from().where() chain
    const whereFn = vi.fn().mockResolvedValue([{ count: 1 }])
    const fromFn = vi.fn().mockReturnValue({ where: whereFn })
    mockDb.select.mockReturnValue({ from: fromFn })

    const result = await listEvents({ page: 1, limit: 20 })
    expect(result.data).toHaveLength(1)
    expect(result.meta.total).toBe(1)
  })
})

// ─── getEventById ─────────────────────────────────────────────────────────────
describe('getEventById', () => {
  it('retourne l\'événement si trouvé', async () => {
    mockDb.query.events.findFirst.mockResolvedValue(fakeEvent)
    const event = await getEventById('uuid-evt-1')
    expect(event.title).toBe('Exposition Photo')
  })

  it('lève AppError 404 si introuvable', async () => {
    mockDb.query.events.findFirst.mockResolvedValue(null)
    await expect(getEventById('uuid-fantome')).rejects.toMatchObject({ statusCode: 404 })
  })
})

// ─── createEvent ──────────────────────────────────────────────────────────────
describe('createEvent', () => {
  it('insère et retourne le nouvel événement', async () => {
    const returning = vi.fn().mockResolvedValue([fakeEvent])
    const values = vi.fn().mockReturnValue({ returning })
    mockDb.insert.mockReturnValue({ values })

    const result = await createEvent({
      title: 'Exposition Photo',
      description: 'Une belle exposition',
      date: '2026-07-01T10:00:00Z',
      venue: 'Paris',
      totalSeats: 100,
      type: 'exposition',
    })
    expect(result.title).toBe('Exposition Photo')
  })
})

// ─── updateEvent ──────────────────────────────────────────────────────────────
describe('updateEvent', () => {
  it('met à jour et retourne l\'événement modifié', async () => {
    mockDb.query.events.findFirst.mockResolvedValue(fakeEvent)
    const returning = vi.fn().mockResolvedValue([{ ...fakeEvent, title: 'Nouveau titre' }])
    const where = vi.fn().mockReturnValue({ returning })
    const set = vi.fn().mockReturnValue({ where })
    mockDb.update.mockReturnValue({ set })

    const result = await updateEvent('uuid-evt-1', { title: 'Nouveau titre' })
    expect(result.title).toBe('Nouveau titre')
  })

  it('lève 404 si l\'événement n\'existe pas', async () => {
    mockDb.query.events.findFirst.mockResolvedValue(null)
    await expect(updateEvent('uuid-fantome', { title: 'X' })).rejects.toMatchObject({ statusCode: 404 })
  })
})

// ─── deleteEvent ──────────────────────────────────────────────────────────────
describe('deleteEvent', () => {
  it('supprime l\'événement sans erreur', async () => {
    mockDb.query.events.findFirst.mockResolvedValue(fakeEvent)
    const where = vi.fn().mockResolvedValue(undefined)
    mockDb.delete.mockReturnValue({ where })

    await expect(deleteEvent('uuid-evt-1')).resolves.toBeUndefined()
  })

  it('lève 404 si l\'événement n\'existe pas', async () => {
    mockDb.query.events.findFirst.mockResolvedValue(null)
    await expect(deleteEvent('uuid-fantome')).rejects.toMatchObject({ statusCode: 404 })
  })
})
