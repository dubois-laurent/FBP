import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <main className="min-h-screen bg-ink text-canvas">
      <h1 className="font-serif text-6xl">Photo Lens</h1>
    </main>
  )
}
