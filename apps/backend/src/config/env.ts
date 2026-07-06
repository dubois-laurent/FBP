import { z } from 'zod'
import 'dotenv/config'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_CALLBACK_URL: z.string().url(),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('BIP BIP BIP TES VARIABLES SONT MAUVAISES LOLO BORDEL')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data
