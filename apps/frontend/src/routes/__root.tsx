import {
  createRootRouteWithContext,
  Outlet,
  Link,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import type { QueryClient } from '@tanstack/react-query'

export interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  notFoundComponent: NotFound,
})

function RootLayout() {
  return (
    <>
      <Outlet />
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </>
  )
}

function NotFound() {
  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center px-4 text-center">
      <p className="font-serif text-8xl text-cobalt mb-4">404</p>
      <h1 className="font-serif text-2xl text-ink mb-2">Page introuvable</h1>
      <p className="text-muted text-sm mb-8">
        Cette page n'existe pas ou a été déplacée.
      </p>
      <Link
        to="/"
        className="px-6 py-2.5 bg-cobalt text-canvas text-sm hover:bg-cobalt-dark transition-colors"
      >
        Retour à l'accueil
      </Link>
    </div>
  )
}
