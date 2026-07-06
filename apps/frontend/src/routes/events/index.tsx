import { createFileRoute, Link } from '@tanstack/react-router'
import { z } from 'zod'
import { Layout } from '@/components/layout/Layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useEvents } from '@/api/events.api'
import { CalendarDays, MapPin, Users, SlidersHorizontal } from 'lucide-react'
import type { EventType } from '@/types'

const searchSchema = z.object({
  type: z.enum(['exposition', 'conference', 'atelier', 'rencontre']).optional(),
  page: z.number().int().min(1).optional().default(1),
})

export const Route = createFileRoute('/events/')({
  validateSearch: searchSchema,
  component: EventsPage,
})

const EVENT_TYPES: { value: EventType | 'all'; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'exposition', label: 'Expositions' },
  { value: 'conference', label: 'Conférences' },
  { value: 'atelier', label: 'Ateliers' },
  { value: 'rencontre', label: 'Rencontres' },
]

function EventsPage() {
  const { type, page } = Route.useSearch()
  const navigate = Route.useNavigate()

  const { data, isLoading } = useEvents({
    type: type ?? undefined,
    page,
    limit: 12,
  })

  const events = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / 12)

  function setType(t: EventType | 'all') {
    navigate({ search: (s) => ({ ...s, type: t === 'all' ? undefined : t, page: 1 }) })
  }

  function setPage(p: number) {
    navigate({ search: (s) => ({ ...s, page: p }) })
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-serif text-4xl md:text-5xl text-ink mb-3">Programme</h1>
          <p className="text-muted">
            {total > 0 ? `${total} événement${total > 1 ? 's' : ''}` : 'Chargement…'}
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          <SlidersHorizontal className="w-4 h-4 text-muted shrink-0" />
          {EVENT_TYPES.map(({ value, label }) => {
            const active = (type ?? 'all') === value
            return (
              <button
                key={value}
                onClick={() => setType(value)}
                className={`px-4 py-1.5 text-sm border transition-colors ${
                  active
                    ? 'bg-cobalt text-canvas border-cobalt'
                    : 'border-border text-muted hover:border-cobalt hover:text-ink'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 bg-surface animate-pulse" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <p className="text-muted py-20 text-center">Aucun événement pour ce filtre.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Link
                key={event.id}
                to="/events/$id"
                params={{ id: event.id }}
                className="group border border-border bg-canvas hover:border-cobalt transition-colors flex flex-col"
              >
                <div className="h-48 bg-surface flex items-center justify-center overflow-hidden">
                  {event.imageUrl ? (
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <span className="font-serif text-4xl text-muted/30">
                      {event.title.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1 gap-3">
                  <Badge variant="outline" className="self-start">{event.type}</Badge>
                  <h3 className="font-medium text-ink group-hover:text-cobalt transition-colors leading-snug">
                    {event.title}
                  </h3>
                  <div className="flex flex-col gap-1 text-xs text-muted mt-auto">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="w-3 h-3" />
                      {new Date(event.date).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'long', year: 'numeric',
                      })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3" />
                      {event.venue}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3 h-3" />
                      {event.availableSeats} place{event.availableSeats > 1 ? 's' : ''} disponible{event.availableSeats > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              ← Précédent
            </Button>
            <span className="flex items-center px-4 text-sm text-muted">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              Suivant →
            </Button>
          </div>
        )}
      </div>
    </Layout>
  )
}
