import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getUserById, updateUser } from './users.service'
import { db } from '../../config/db'

const mockDb = db as unknown as {
  query: { users: { findFirst: ReturnType<typeof vi.fn> } }
  update: ReturnType<typeof vi.fn>
}

beforeEach(() => vi.clearAllMocks())

describe('getUserById', () => {
  it('retourne l\'utilisateur si trouvé', async () => {
    mockDb.query.users.findFirst.mockResolvedValue({
      id: 'uuid-1', name: 'Alice', email: 'alice@test.com', role: 'user',
    })
    const user = await getUserById('uuid-1')
    expect(user.email).toBe('alice@test.com')
  })

  it('lève AppError 404 si introuvable', async () => {
    mockDb.query.users.findFirst.mockResolvedValue(null)
    await expect(getUserById('uuid-fantome')).rejects.toMatchObject({ statusCode: 404 })
  })
})

describe('updateUser', () => {
  it('met à jour le nom et retourne l\'utilisateur modifié', async () => {
    const returning = vi.fn().mockResolvedValue([{
      id: 'uuid-1', name: 'Alice Modifiée', email: 'alice@test.com', role: 'user',
    }])
    const where = vi.fn().mockReturnValue({ returning })
    const set = vi.fn().mockReturnValue({ where })
    mockDb.update.mockReturnValue({ set })

    const result = await updateUser('uuid-1', { name: 'Alice Modifiée' })
    expect(result.name).toBe('Alice Modifiée')
  })

  it('hash le nouveau mot de passe avant de le stocker', async () => {
    const returning = vi.fn().mockResolvedValue([{
      id: 'uuid-1', name: 'Alice', email: 'alice@test.com', role: 'user',
    }])
    const where = vi.fn().mockReturnValue({ returning })
    const set = vi.fn().mockReturnValue({ where })
    mockDb.update.mockReturnValue({ set })

    await updateUser('uuid-1', { password: 'nouveaupassword' })

    // Vérifier que set() a bien reçu un password hashé (pas le plaintext)
    const setArg = set.mock.calls[0][0] as Record<string, string>
    expect(setArg.password).not.toBe('nouveaupassword')
    expect(setArg.password).toMatch(/^\$2[ab]\$/)
  })
})
