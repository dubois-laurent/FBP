import { createFileRoute, Link } from '@tanstack/react-router'
import { requireAuth } from '@/lib/auth-guard'
import { Layout } from '@/components/layout/Layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useMyBookings, useCancelBooking } from '@/api/bookings.api'
import { CalendarDays, MapPin, Ticket } from 'lucide-react'

export const Route = createFileRoute('/bookings')({
  beforeLoad: requireAuth,
  component: BookingsPage,
})

function BookingsPage() {
  const { data: bookings = [], isLoading } = useMyBookings()
  const { mutate: cancel, isPending: isCancelling } = useCancelBooking()

  const confirmed = bookings.filter((b) => b.status === 'confirmed')
  const cancelled = bookings.filter((b) => b.status === 'cancelled')

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="font-serif text-4xl text-ink mb-2">Mes réservations</h1>
          <p className="text-muted">{confirmed.length} réservation{confirmed.length > 1 ? 's' : ''} confirmée{confirmed.length > 1 ? 's' : ''}</p>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 bg-surface animate-pulse" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20">
            <Ticket className="w-12 h-12 text-muted/30 mx-auto mb-4" />
            <p className="text-muted mb-6">Aucune réservation pour le moment.</p>
            <Button asChild>
              <Link to="/events">Voir le programme</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {confirmed.map((booking) => (
              <div
                key={booking.id}
                className="border border-border bg-canvas p-5 flex flex-col md:flex-row md:items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="success">Confirmée</Badge>
                    <Badge variant="surface">{booking.event.type}</Badge>
                  </div>
                  <Link
                    to="/events/$id"
                    params={{ id: booking.eventId }}
                    className="font-medium text-ink hover:text-cobalt transition-colors"
                  >
                    {booking.event.title}
                  </Link>
                  <div className="flex flex-wrap gap-4 mt-1 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />
                      {new Date(booking.event.date).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'long', year: 'numeric',
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {booking.event.location}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0"
                  disabled={isCancelling}
                  onClick={() => cancel(booking.id)}
                >
                  Annuler
                </Button>
              </div>
            ))}

            {cancelled.length > 0 && (
              <>
                <h2 className="font-medium text-muted text-sm mt-6 mb-2 uppercase tracking-widest">
                  Annulées
                </h2>
                {cancelled.map((booking) => (
                  <div
                    key={booking.id}
                    className="border border-border bg-surface p-5 opacity-60"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="destructive">Annulée</Badge>
                    </div>
                    <p className="font-medium text-ink">{booking.event.title}</p>
                    <p className="text-xs text-muted mt-1">
                      {new Date(booking.event.date).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'long', year: 'numeric',
                      })}
                    </p>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
