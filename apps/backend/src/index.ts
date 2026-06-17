import 'dotenv/config'
import express, { type Express } from 'express'
import cors from 'cors'
import { createServer, type Server } from 'http'
import { env } from './config/env'
import passport from './config/passport'
import authRouter from './routes/auth/auth.routes'
import usersRouter from './routes/users/users.routes'
import eventsRouter from './routes/events/events.routes'
import bookingsRouter from './routes/bookings/bookings.routes'
import messagesRouter from './routes/messages/messages.routes'
import { errorHandler } from './middleware'
import { initSocket } from './sockets/socket'

const app: Express = express()
const httpServer: Server = createServer(app)

app.use(cors({ origin: env.FRONTEND_URL, credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(passport.initialize())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ROUTES
app.use('/auth', authRouter)
app.use('/users', usersRouter)
app.use('/events', eventsRouter)
app.use('/bookings', bookingsRouter)
app.use('/messages', messagesRouter)

// ERROR HANDLER
app.use(errorHandler)

// SOCKET.IO
initSocket(httpServer)

httpServer.listen(env.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${env.PORT}`)
  console.log(`📋 Swagger docs: http://localhost:${env.PORT}/api/docs`)
  console.log(`🌍 Environment: ${env.NODE_ENV}`)
})

export { app, httpServer }

