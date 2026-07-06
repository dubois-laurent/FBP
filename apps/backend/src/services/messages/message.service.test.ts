import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getConversation, createMessage } from './messages.service'
import { db } from '../../config/db'

const mockDb = db as unknown as {
  query: { messages: { findMany: ReturnType<typeof vi.fn> } }
  insert: ReturnType<typeof vi.fn>
}

const fakeMessage = {
  id: 'uuid-msg-1',
  senderId: 'uuid-user-1',
  receiverId: 'uuid-user-2',
  content: 'Bonjour !',
  sentAt: new Date(),
}

beforeEach(() => vi.clearAllMocks())

describe('getConversation', () => {
  it('retourne les messages entre deux utilisateurs', async () => {
    mockDb.query.messages.findMany.mockResolvedValue([fakeMessage])

    const result = await getConversation('uuid-user-1', 'uuid-user-2')
    expect(result).toHaveLength(1)
    expect(result[0].content).toBe('Bonjour !')
  })

  it('retourne un tableau vide si aucun message', async () => {
    mockDb.query.messages.findMany.mockResolvedValue([])

    const result = await getConversation('uuid-user-1', 'uuid-user-2')
    expect(result).toHaveLength(0)
  })
})

describe('createMessage', () => {
  it('insère et retourne le message créé', async () => {
    const returning = vi.fn().mockResolvedValue([fakeMessage])
    const values = vi.fn().mockReturnValue({ returning })
    mockDb.insert.mockReturnValue({ values })

    const result = await createMessage('uuid-user-1', 'uuid-user-2', 'Bonjour !')
    expect(result.content).toBe('Bonjour !')
    expect(result.senderId).toBe('uuid-user-1')
    expect(result.receiverId).toBe('uuid-user-2')
  })
})
