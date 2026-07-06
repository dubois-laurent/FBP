import { createFileRoute, Link } from '@tanstack/react-router'
import { Layout } from '@/components/layout/Layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useEvent } from '@/api/events.api'
import { useMyBookings, useCreateBooking } from '@/api/bookings.api'
import { useAuthStore, selectIsAuthenticated } from '@/store/auth.store'
import { CalendarDays, MapPin, Users, ArrowLeft, CheckCircle } from 'lucide-react'

export const Route = createFileRoute('/events/$id')({
  component: EventDetailPage,
})

function EventDetailPage() {
  const { id } = Route.useParams()
  const isAuthenticated = useAuthStore(selectIsAuthenticated)

  const { data: event, isLoading, isError } = useEvent(id)
  const { data: bookings = [] } = useMyBookings()
  const { mutate: createBooking, isPending: isBooking } = useCreateBooking()

  const alreadyBooked = bookings.some(
    (b) => b.eventId === id && b.status === 'confirmed'
  )
  const isFull = event ? event.availableSeats === 0 : false

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="h-64 bg-surface animate-pulse mb-8" />
          <div className="h-8 bg-surface animate-pulse w-2/3 mb-4" />
          <div className="h-4 bg-surface animate-pulse w-1/2" />
        </div>
      </Layout>
    )
  }

  if (isError || !event) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <p className="text-muted mb-4">Événement introuvable.</p>
          <Button variant="outline" asChild>
            <Link to="/events">← Retour au programme</Link>
          </Button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Back */}
        <Link
          to="/events"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Programme
        </Link>

        {/* Hero image */}
        <div className="w-full h-72 md:h-96 bg-surface mb-8 overflow-hidden">
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="font-serif text-8xl text-muted/20">
                {event.title.charAt(0)}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Main content */}
          <div className="md:col-span-2">
            <Badge variant="outline" className="mb-4">{event.type}</Badge>
            <h1 className="font-serif text-3xl md:text-4xl text-ink mb-6 leading-tight">
              {event.title}
            </h1>
            <p className="text-muted leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-6">
            <div className="border border-border p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-2 text-sm">
                <span className="flex items-center gap-2 text-muted">
                  <CalendarDays className="w-4 h-4 shrink-0" />
                  {new Date(event.date).toLocaleDateString('fr-FR', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </span>
                <span className="flex items-center gap-2 text-muted">
                  <MapPin className="w-4 h-4 shrink-0" />
                  {event.location}
                </span>
                <span className="flex items-center gap-2 text-muted">
                  <Users className="w-4 h-4 shrink-0" />
                  {event.availableSeats} / {event.totalSeats} places disponibles
                </span>
              </div>

              <div className="border-t border-border pt-4">
                {!isAuthenticated ? (
                  <Button className="w-full" asChild>
                    <Link to="/login">Se connecter pour réserver</Link>
                  </Button>
                ) : alreadyBooked ? (
                  <div className="flex items-center gap-2 text-sm text-green-700 justify-center py-2">
                    <CheckCircle className="w-4 h-4" />
                    Réservation confirmée
                  </div>
                ) : isFull ? (
                  <Button className="w-full" disabled>
                    Complet
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    disabled={isBooking}
                    onClick={() => createBooking(event.id)}
                  >
                    {isBooking ? 'Réservation…' : 'Réserver ma place'}
                  </Button>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  )
}
