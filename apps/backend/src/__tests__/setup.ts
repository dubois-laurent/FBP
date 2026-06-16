import { vi } from 'vitest'

// Charger les variables d'env de test avant tout
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/fpb_test'
process.env.JWT_ACCESS_SECRET = 'test_access_secret_min_32_characters_long'
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_min_32_characters_long'
process.env.JWT_ACCESS_EXPIRES_IN = '15m'
process.env.JWT_REFRESH_EXPIRES_IN = '7d'
process.env.GOOGLE_CLIENT_ID = 'test_google_client_id'
process.env.GOOGLE_CLIENT_SECRET = 'test_google_client_secret'
process.env.GOOGLE_CALLBACK_URL = 'http://localhost:3000/auth/google/callback'
process.env.FRONTEND_URL = 'http://localhost:5173'
process.env.PORT = '3001'

// Mock global de la connexion DB — chaque test surcharge les méthodes nécessaires
vi.mock('../config/db', () => ({
  db: {
    query: {
      users: { findFirst: vi.fn() },
      events: { findFirst: vi.fn(), findMany: vi.fn() },
      bookings: { findFirst: vi.fn(), findMany: vi.fn() },
    },
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    select: vi.fn(),
  },
}))
