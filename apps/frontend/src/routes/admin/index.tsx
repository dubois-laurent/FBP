import { createFileRoute } from '@tanstack/react-router'
import { requireAdmin } from '@/lib/auth-guard'

export const Route = createFileRoute('/admin/')({
  beforeLoad: requireAdmin,
  component: () => null,
})
