import { createFileRoute, Link } from '@tanstack/react-router'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useEvents } from '@/api/events.api'
import { CalendarDays, MapPin, Users } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const { data } = useEvents({ limit: 4 })
  const events = data?.data ?? []

  return (
    <Layout fullBleed>
      {/* ── Hero ── */}
      <section
        className="relative min-h-screen flex flex-col justify-end pb-20 px-6 md:px-16 bg-ink"
        style={{
          backgroundImage:
            'linear-gradient(to bottom, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.7) 60%, rgba(10,10,10,0.95) 100%)',
        }}
      >
        {/* Overlay texture */}
        <div className="absolute inset-0 bg-ink/60" />

        <div className="relative max-w-4xl">
          <p className="text-xs tracking-[0.3em] uppercase text-canvas/50 mb-6">
            Festival International Photo Lens de Paris, 2026
          </p>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-canvas leading-[1.05] mb-8">
            La photographie<br />
            comme territoire
          </h1>
          <p className="text-base md:text-lg text-canvas/70 max-w-lg mb-10 leading-relaxed">
            Expositions, conférences, ateliers et rencontres avec les grands
            noms de la photographie contemporaine.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button size="lg" asChild>
              <Link to="/events">Voir le programme</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-canvas/40 text-canvas hover:bg-canvas/10 hover:text-canvas" asChild>
              <Link to="/register">S'inscrire</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Programme ── */}
      {events.length > 0 && (
        <section className="py-20 px-6 md:px-16 max-w-7xl mx-auto w-full">
          <div className="flex items-baseline justify-between mb-12">
            <h2 className="font-serif text-3xl md:text-4xl text-ink">Programme</h2>
            <Link to="/events" className="text-sm text-cobalt hover:underline">
              Tout voir →
            </Link>
          </div>

          <div className="divide-y divide-border">
            {events.map((event) => (
              <Link
                key={event.id}
                to="/events/$id"
                params={{ id: event.id }}
                className="group flex flex-col md:flex-row md:items-center gap-4 py-6 hover:bg-surface transition-colors px-2 -mx-2"
              >
                <time className="font-serif text-2xl text-cobalt w-20 shrink-0">
                  {new Date(event.date).getDate().toString().padStart(2, '0')}
                  <span className="block text-xs font-sans text-muted uppercase tracking-widest">
                    {new Date(event.date).toLocaleString('fr-FR', { month: 'short' })}
                  </span>
                </time>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline">{event.type}</Badge>
                  </div>
                  <h3 className="font-medium text-ink group-hover:text-cobalt transition-colors truncate">
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {event.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {event.availableSeats} places
                    </span>
                  </div>
                </div>

                <CalendarDays className="w-4 h-4 text-muted shrink-0 hidden md:block group-hover:text-cobalt transition-colors" />
              </Link>
            ))}
          </div>
        </section>
      )}
    </Layout>
  )
}
