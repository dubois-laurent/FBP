import React from 'react'
import { Link, useRouter } from '@tanstack/react-router'
import { CalendarDays, Ticket, User, LogOut, Menu, X, MessageSquare } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuthStore, selectIsAuthenticated, selectIsAdmin } from '@/store/auth.store'
import { useLogout } from '@/api/auth.api'
import { cn } from '@/lib/utils'

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const isAdmin = useAuthStore(selectIsAdmin)
  const user = useAuthStore((s) => s.user)
  const { mutate: logout } = useLogout()
  const router = useRouter()

  function handleLogout() {
    logout(undefined, {
      onSettled: () => router.navigate({ to: '/' }),
    })
  }

  const navLinks = [
    { to: '/events', label: 'Événements', icon: CalendarDays },
    ...(isAuthenticated
      ? [
          { to: '/bookings', label: 'Mes réservations', icon: Ticket },
          { to: '/messages', label: 'Messages', icon: MessageSquare },
          { to: '/profile', label: 'Profil', icon: User },
          ...(isAdmin ? [{ to: '/admin', label: 'Admin', icon: null }] : []),
        ]
      : []),
  ]

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-canvas/90 backdrop-blur-sm border-b border-border">
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="font-serif text-xl text-ink hover:text-cobalt transition-colors">
          Photo Lens
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-6">
          {navLinks.map(({ to, label }) => (
            <li key={to}>
              <Link
                to={to}
                className="text-sm text-muted hover:text-ink transition-colors"
                activeProps={{ className: 'text-cobalt font-medium' }}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Auth actions */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-muted">{user?.name}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-1" />
                Déconnexion
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Connexion</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">S'inscrire</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-ink"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-canvas px-6 py-4 flex flex-col gap-4">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-2 text-sm text-ink"
              onClick={() => setMenuOpen(false)}
            >
              {Icon && <Icon className="w-4 h-4" />}
              {label}
            </Link>
          ))}
          {isAuthenticated ? (
            <button
              className="flex items-center gap-2 text-sm text-muted"
              onClick={() => { handleLogout(); setMenuOpen(false) }}
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          ) : (
            <div className="flex flex-col gap-2 pt-2 border-t border-border">
              <Link to="/login" className="text-sm text-ink" onClick={() => setMenuOpen(false)}>
                Connexion
              </Link>
              <Link to="/register" className="text-sm font-medium text-cobalt" onClick={() => setMenuOpen(false)}>
                S'inscrire
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
