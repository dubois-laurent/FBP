import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { z } from 'zod'
import { useAuthStore } from '@/store/auth.store'
import { usersApi } from '@/api/users.api'

const searchSchema = z.object({
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  error: z.string().optional(),
})

export const Route = createFileRoute('/auth/callback')({
  validateSearch: searchSchema,
  component: AuthCallbackPage,
})

function AuthCallbackPage() {
  const { accessToken, refreshToken, error } = Route.useSearch()
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const setTokens = useAuthStore((s) => s.setTokens)
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    if (error || !accessToken || !refreshToken) {
      void navigate({ to: '/login', search: { error: error ?? 'auth_failed' }, replace: true })
      return
    }

    // Store tokens first so the API call can attach the Bearer header
    setTokens(accessToken, refreshToken)

    // Fetch the user profile and complete the auth
    usersApi
      .getMe()
      .then((user) => {
        setAuth(user, accessToken, refreshToken)
        // Replace the history entry to remove tokens from the URL
        void navigate({ to: '/', replace: true })
      })
      .catch(() => {
        void navigate({ to: '/login', search: { error: 'auth_failed' }, replace: true })
      })
  }, [accessToken, refreshToken, error, navigate, setAuth, setTokens])

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas">
      <div className="flex flex-col items-center gap-4 text-muted">
        <div className="w-8 h-8 border-2 border-cobalt border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">Connexion en cours…</p>
      </div>
    </div>
  )
}
