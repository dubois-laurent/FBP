import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/events/$id')({
  component: () => null,
})
