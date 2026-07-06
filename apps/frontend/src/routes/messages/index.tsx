import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { requireAuth } from '@/lib/auth-guard'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore, selectIsAdmin } from '@/store/auth.store'
import { MessageSquare } from 'lucide-react'

export const Route = createFileRoute('/messages/')({
  beforeLoad: requireAuth,
  component: MessagesIndexPage,
})

// Fixed support user ID — in production this would come from an env variable or API
const SUPPORT_USER_ID = 'support'

function MessagesIndexPage() {
  const navigate = useNavigate()
  const isAdmin = useAuthStore(selectIsAdmin)
  const [userId, setUserId] = useState('')

  function openConversation(id: string) {
    if (!id.trim()) return
    void navigate({ to: '/messages/$userId', params: { userId: id.trim() } })
  }

  if (isAdmin) {
    return (
      <Layout>
        <div className="max-w-lg mx-auto px-4 py-16">
          <div className="mb-8">
            <h1 className="font-serif text-3xl text-ink mb-2">Messagerie admin</h1>
            <p className="text-muted text-sm">
              Entrez l'identifiant d'un utilisateur pour démarrer une conversation.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Label htmlFor="userId">Identifiant utilisateur</Label>
            <div className="flex gap-2">
              <Input
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="uuid de l'utilisateur…"
                onKeyDown={(e) => e.key === 'Enter' && openConversation(userId)}
                className="flex-1"
              />
              <Button onClick={() => openConversation(userId)} disabled={!userId.trim()}>
                Ouvrir
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <MessageSquare className="w-12 h-12 text-cobalt/30 mx-auto mb-6" />
        <h1 className="font-serif text-3xl text-ink mb-3">Messages</h1>
        <p className="text-muted text-sm mb-8">
          Contactez notre équipe pour toute question concernant un événement ou une réservation.
        </p>
        <Button onClick={() => openConversation(SUPPORT_USER_ID)}>
          Contacter le support
        </Button>
      </div>
    </Layout>
  )
}
