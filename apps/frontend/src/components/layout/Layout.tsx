import React from 'react'
import { Navbar } from './Navbar'
import { cn } from '@/lib/utils'

interface LayoutProps {
  children: React.ReactNode
  className?: string
  /** Remove top padding (for hero pages that go full-bleed under the navbar) */
  fullBleed?: boolean
}

export function Layout({ children, className, fullBleed = false }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <Navbar />
      <main className={cn(!fullBleed && 'pt-16', 'flex-1', className)}>{children}</main>
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted">
          <span className="font-serif text-ink">Photo Lens</span>
          <span>© {new Date().getFullYear()} — Tous droits réservés</span>
        </div>
      </footer>
    </div>
  )
}
