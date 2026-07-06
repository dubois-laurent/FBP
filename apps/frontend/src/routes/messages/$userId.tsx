import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { requireAuth } from '@/lib/auth-guard'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useConversation, messageKeys } from '@/api/messages.api'
import { useAuthStore } from '@/store/auth.store'
import { useSocket } from '@/hooks/useSocket'
import { useQueryClient } from '@tanstack/react-query'
import type { Message } from '@/types'
import { Send } from 'lucide-react'

export const Route = createFileRoute('/messages/$userId')({
  beforeLoad: requireAuth,
  component: MessagesPage,
})

function MessagesPage() {
  const { userId } = Route.useParams()
  const currentUser = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()
  const socketRef = useSocket()

  const { data: initial = [], isLoading } = useConversation(userId)
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  // Sync fetched messages into local state
  useEffect(() => {
    setMessages(initial)
  }, [initial])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Socket: receive incoming messages
  useEffect(() => {
    const socket = socketRef.current
    if (!socket) return

    function handleReceive(msg: Message) {
      if (msg.senderId === userId || msg.receiverId === userId) {
        setMessages((prev) => [...prev, msg])
        void queryClient.invalidateQueries({ queryKey: messageKeys.conversation(userId) })
      }
    }

    socket.on('receive_message', handleReceive)
    return () => {
      socket.off('receive_message', handleReceive)
    }
  }, [socketRef, userId, queryClient])

  function sendMessage() {
    const content = text.trim()
    if (!content || !socketRef.current) return

    socketRef.current.emit('send_message', { receiverId: userId, content })

    // Optimistic update
    if (currentUser) {
      const optimistic: Message = {
        id: `optimistic-${Date.now()}`,
        senderId: currentUser.id,
        receiverId: userId,
        content,
        createdAt: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, optimistic])
    }

    setText('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col h-[calc(100vh-64px)]">
        {/* Header */}
        <div className="border-b border-border pb-4 mb-4">
          <h1 className="font-serif text-2xl text-ink">Conversation</h1>
          <p className="text-muted text-sm mt-0.5">avec l'utilisateur {userId}</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-3 py-2">
          {isLoading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-10 w-2/3 bg-surface animate-pulse ${i % 2 === 0 ? 'self-start' : 'self-end'}`}
                />
              ))}
            </div>
          ) : messages.length === 0 ? (
            <p className="text-muted text-center text-sm py-10">
              Aucun message. Commencez la conversation !
            </p>
          ) : (
            messages.map((msg) => {
              const isMine = msg.senderId === currentUser?.id
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-2 text-sm leading-relaxed ${
                      isMine
                        ? 'bg-cobalt text-canvas'
                        : 'bg-surface text-ink border border-border'
                    }`}
                  >
                    {msg.content}
                    <span
                      className={`block text-[10px] mt-1 ${
                        isMine ? 'text-canvas/60' : 'text-muted'
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              )
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border pt-4 flex gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Votre message…"
            className="flex-1"
          />
          <Button onClick={sendMessage} disabled={!text.trim()}>
            <Send size={16} />
            <span className="sr-only">Envoyer</span>
          </Button>
        </div>
      </div>
    </Layout>
  )
}
