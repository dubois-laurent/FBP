import 'dotenv/config'
import express, { type Express } from 'express'
import cors from 'cors'
import { createServer, type Server } from 'http'
import { env } from './config/env'
import passport from './config/passport'
import authRouter from './routes/auth/auth.routes'
import { errorHandler } from './middleware'

const app: Express = express()
const httpServer: Server = createServer(app)

app.use(cors({ origin: env.FRONTEND_URL, credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(passport.initialize())

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/auth', authRouter)

// ─── Error handler (doit être APRÈS toutes les routes) ────────────────────────
app.use(errorHandler)

httpServer.listen(env.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${env.PORT}`)
  console.log(`📋 Swagger docs: http://localhost:${env.PORT}/api/docs`)
  console.log(`🌍 Environment: ${env.NODE_ENV}`)
})

export { app, httpServer }
