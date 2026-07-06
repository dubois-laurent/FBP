import { redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/store/auth.store'

/**
 * À utiliser dans `beforeLoad` des routes protégées.
 * Redirige vers /login si l'utilisateur n'est pas authentifié.
 */
export function requireAuth({ location }: { location: { href: string } }) {
  const { accessToken } = useAuthStore.getState()
  if (!accessToken) {
    throw redirect({
      to: '/login',
      search: { redirect: location.href },
    })
  }
}

/**
 * À utiliser dans `beforeLoad` des routes admin.
 */
export function requireAdmin({ location }: { location: { href: string } }) {
  const { accessToken, user } = useAuthStore.getState()
  if (!accessToken) {
    throw redirect({ to: '/login', search: { redirect: location.href } })
  }
  if (user?.role !== 'admin') {
    throw redirect({ to: '/' })
  }
}
