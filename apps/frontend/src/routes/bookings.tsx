import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/lib/auth-guard'

export const Route = createFileRoute('/bookings')({
  beforeLoad: requireAuth,
  component: () => null,
})
