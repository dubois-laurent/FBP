import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createUser, validateCredentials, findOrCreateGoogleUser, findUserById } from './auth.service'
import { db } from '../../config/db'

const mockDb = db as unknown as {
  query: {
    users: {
      findFirst: ReturnType<typeof vi.fn>
    }
  }
  insert: ReturnType<typeof vi.fn>
  update: ReturnType<typeof vi.fn>
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ─── createUser ───────────────────────────────────────────────────────────────
describe('createUser', () => {
  it('crée et retourne un nouvel utilisateur', async () => {
    mockDb.query.users.findFirst.mockResolvedValue(null)

    const returning = vi.fn().mockResolvedValue([{
      id: 'uuid-1', name: 'Alice', email: 'alice@test.com', role: 'user',
    }])
    mockDb.insert.mockReturnValue({ values: vi.fn().mockReturnValue({ returning }) })

    const result = await createUser({ name: 'Alice', email: 'alice@test.com', password: 'password123' })

    expect(result.email).toBe('alice@test.com')
    expect(result.role).toBe('user')
  })

  it('lève EMAIL_TAKEN si l\'email est déjà pris', async () => {
    mockDb.query.users.findFirst.mockResolvedValue({ id: 'existing', email: 'alice@test.com' })

    await expect(
      createUser({ name: 'Alice', email: 'alice@test.com', password: 'password123' }),
    ).rejects.toMatchObject({ code: 'EMAIL_TAKEN' })
  })
})

// ─── validateCredentials ──────────────────────────────────────────────────────
describe('validateCredentials', () => {
  it('retourne l\'utilisateur si les identifiants sont corrects', async () => {
    const bcrypt = await import('bcryptjs')
    const hashed = await bcrypt.hash('password123', 12)

    mockDb.query.users.findFirst.mockResolvedValue({
      id: 'uuid-1', name: 'Alice', email: 'alice@test.com', password: hashed, role: 'user',
    })

    const result = await validateCredentials({ email: 'alice@test.com', password: 'password123' })
    expect(result.email).toBe('alice@test.com')
  })

  it('lève une erreur si le mot de passe est incorrect', async () => {
    const bcrypt = await import('bcryptjs')
    const hashed = await bcrypt.hash('autrepassword', 12)

    mockDb.query.users.findFirst.mockResolvedValue({
      id: 'uuid-1', email: 'alice@test.com', password: hashed, role: 'user',
    })

    await expect(
      validateCredentials({ email: 'alice@test.com', password: 'mauvaispassword' }),
    ).rejects.toThrow('Email ou mot de passe incorrect')
  })

  it('lève une erreur si l\'utilisateur n\'existe pas', async () => {
    mockDb.query.users.findFirst.mockResolvedValue(null)

    await expect(
      validateCredentials({ email: 'inconnu@test.com', password: 'password123' }),
    ).rejects.toThrow('Email ou mot de passe incorrect')
  })
})

// ─── findOrCreateGoogleUser ───────────────────────────────────────────────────
describe('findOrCreateGoogleUser', () => {
  const profile = { googleId: 'gid-123', email: 'alice@gmail.com', displayName: 'Alice Google' }

  it('retourne l\'utilisateur existant s\'il a déjà un googleId', async () => {
    mockDb.query.users.findFirst.mockResolvedValue({
      id: 'uuid-1', email: 'alice@gmail.com', role: 'user', googleId: 'gid-123',
    })

    const result = await findOrCreateGoogleUser(profile)
    expect(result.email).toBe('alice@gmail.com')
    expect(mockDb.insert).not.toHaveBeenCalled()
  })

  it('crée un nouvel utilisateur si aucun compte n\'existe', async () => {
    mockDb.query.users.findFirst.mockResolvedValue(null)

    const returning = vi.fn().mockResolvedValue([{
      id: 'uuid-new', email: 'alice@gmail.com', role: 'user', googleId: 'gid-123',
    }])
    mockDb.insert.mockReturnValue({ values: vi.fn().mockReturnValue({ returning }) })

    const result = await findOrCreateGoogleUser(profile)
    expect(result.email).toBe('alice@gmail.com')
    expect(mockDb.insert).toHaveBeenCalled()
  })
})

// ─── findUserById ─────────────────────────────────────────────────────────────
describe('findUserById', () => {
  it('retourne l\'utilisateur si trouvé', async () => {
    mockDb.query.users.findFirst.mockResolvedValue({ id: 'uuid-1', email: 'alice@test.com', role: 'user' })

    const result = await findUserById('uuid-1')
    expect(result.id).toBe('uuid-1')
  })

  it('lève une erreur si introuvable', async () => {
    mockDb.query.users.findFirst.mockResolvedValue(null)

    await expect(findUserById('uuid-fantome')).rejects.toThrow('Utilisateur introuvable')
  })
})
