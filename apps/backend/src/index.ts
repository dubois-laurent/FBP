import 'dotenv/config'
import express, { type Express } from 'express'
import cors from 'cors'
import { createServer, type Server } from 'http'
import { env } from './config/env'
import authRouter from './routes/auth.routes'

const app: Express = express()
const httpServer: Server = createServer(app)

app.use(cors({ origin: env.FRONTEND_URL, credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/auth', authRouter)

httpServer.listen(env.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${env.PORT}`)
  console.log(`📋 Swagger docs: http://localhost:${env.PORT}/api/docs`)
  console.log(`🌍 Environment: ${env.NODE_ENV}`)
})

export { app, httpServer }
