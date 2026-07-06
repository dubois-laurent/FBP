import { Server as HttpServer } from 'http'
import { Server as SocketIOServer, type Socket } from 'socket.io'
import { env } from '../config/env'
import { verifyAccessToken } from '../lib/jwt'
import { createMessage } from '../services/messages/messages.service'
import type { AuthUser } from '../types/auth'

interface SendMessagePayload {
  receiverId: string
  content: string
}

export function initSocket(httpServer: HttpServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: { origin: env.FRONTEND_URL, credentials: true },
  })

  // Middleware d'authentification JWT
  io.use((socket, next) => {
    const token = socket.handshake.auth['token'] as string | undefined
    if (!token) return next(new Error('Token manquant'))
    try {
      const payload = verifyAccessToken(token)
      socket.data.user = { id: payload.sub, email: payload.email, role: payload.role } satisfies AuthUser
      next()
    } catch {
      next(new Error('Token invalide ou expiré'))
    }
  })

  io.on('connection', (socket: Socket) => {
    const user = socket.data.user as AuthUser

    // Chaque utilisateur rejoint sa propre room privée (identifiée par son userId)
    socket.join(user.id)

    socket.on('send_message', async (payload: SendMessagePayload) => {
      const { receiverId, content } = payload ?? {}

      if (!receiverId || typeof content !== 'string' || !content.trim()) {
        socket.emit('error', { message: 'receiverId et content sont requis' })
        return
      }

      try {
        const message = await createMessage(user.id, receiverId, content.trim())

        // Émettre au destinataire (toutes ses sessions)
        io.to(receiverId).emit('receive_message', message)
        // Émettre en retour à l'expéditeur (pour le multi-onglet)
        socket.emit('receive_message', message)
      } catch {
        socket.emit('error', { message: "Erreur lors de l'envoi du message" })
      }
    })

    socket.on('disconnect', () => {
      socket.leave(user.id)
    })
  })

  return io
}
