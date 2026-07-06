import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLogin } from '@/api/auth.api'

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
})

type LoginForm = z.infer<typeof loginSchema>

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const { mutate: login, isPending, error } = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  function onSubmit(data: LoginForm) {
    login(data, {
      onSuccess: () => navigate({ to: '/' }),
    })
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link to="/" className="font-serif text-2xl text-ink">
            FestivalPhoto
          </Link>
          <p className="mt-2 text-sm text-muted">Connectez-vous à votre compte</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="vous@exemple.com"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-600 text-center">
              Identifiants invalides. Veuillez réessayer.
            </p>
          )}

          <Button type="submit" disabled={isPending} className="mt-2 w-full">
            {isPending ? 'Connexion…' : 'Se connecter'}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <a
            href="/api/auth/google"
            className="inline-flex items-center justify-center w-full h-10 border border-border text-sm text-ink hover:bg-surface transition-colors gap-2"
          >
            Continuer avec Google
          </a>
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-cobalt hover:underline">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  )
}
