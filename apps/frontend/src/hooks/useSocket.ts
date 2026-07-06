import { useEffect, useRef, type MutableRefObject } from 'react'
import { io, type Socket } from 'socket.io-client'
import { useAuthStore } from '@/store/auth.store'

export function useSocket(): MutableRefObject<Socket | null> {
  const accessToken = useAuthStore((s) => s.accessToken)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!accessToken) return

    const socket = io('/', {
      auth: { token: accessToken },
      transports: ['websocket'],
      autoConnect: true,
    })

    socketRef.current = socket

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [accessToken])

  return socketRef
}
