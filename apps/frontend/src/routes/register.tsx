import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRegister } from '@/api/auth.api'

const registerSchema = z.object({
  name: z.string().min(2, 'Minimum 2 caractères'),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 caractères'),
})

type RegisterForm = z.infer<typeof registerSchema>

export const Route = createFileRoute('/register')({
  component: RegisterPage,
})

function RegisterPage() {
  const navigate = useNavigate()
  const { mutate: register, isPending, error } = useRegister()

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) })

  function onSubmit(data: RegisterForm) {
    register(data, {
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
          <p className="mt-2 text-sm text-muted">Créez votre compte</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Nom complet</Label>
            <Input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Jean Dupont"
              {...formRegister('name')}
            />
            {errors.name && (
              <p className="text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="vous@exemple.com"
              {...formRegister('email')}
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
              autoComplete="new-password"
              placeholder="Minimum 8 caractères"
              {...formRegister('password')}
            />
            {errors.password && (
              <p className="text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-600 text-center">
              Une erreur est survenue. Cet email est peut-être déjà utilisé.
            </p>
          )}

          <Button type="submit" disabled={isPending} className="mt-2 w-full">
            {isPending ? 'Création…' : 'Créer mon compte'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-cobalt hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
