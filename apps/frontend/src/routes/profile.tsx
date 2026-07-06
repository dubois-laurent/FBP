import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/lib/auth-guard'

export const Route = createFileRoute('/profile')({
  beforeLoad: requireAuth,
  component: () => null,
})
