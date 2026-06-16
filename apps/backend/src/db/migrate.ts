import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { Pool } from 'pg'
import { env } from '../config/env'

async function runMigrations() {
  console.log('Migration started')

  const pool = new Pool({ connectionString: env.DATABASE_URL })
  const db = drizzle(pool)

  await migrate(db, { migrationsFolder: './src/db/migrations' })

  await pool.end()
  console.log('Migrations completed let\'s goooooooo')
}

runMigrations().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
