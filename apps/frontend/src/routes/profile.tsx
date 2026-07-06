import { createFileRoute } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth-guard'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useMe, useUpdateMe } from '@/api/users.api'
import { useEffect } from 'react'

const profileSchema = z.object({
  name: z.string().min(2, 'Minimum 2 caractères'),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 caractères').optional().or(z.literal('')),
})

type ProfileForm = z.infer<typeof profileSchema>

export const Route = createFileRoute('/profile')({
  beforeLoad: requireAuth,
  component: ProfilePage,
})

function ProfilePage() {
  const { data: me, isLoading } = useMe()
  const { mutate: update, isPending, isSuccess, isError } = useUpdateMe()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileForm>({ resolver: zodResolver(profileSchema) })

  useEffect(() => {
    if (me) reset({ name: me.name, email: me.email, password: '' })
  }, [me, reset])

  function onSubmit({ password, ...data }: ProfileForm) {
    update({ ...data, ...(password ? { password } : {}) })
  }

  return (
    <Layout>
      <div className="max-w-lg mx-auto px-6 py-12">
        <h1 className="font-serif text-4xl text-ink mb-8">Mon profil</h1>

        {isLoading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 bg-surface animate-pulse" />
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Nom complet</Label>
              <Input id="name" {...register('name')} />
              {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} />
              {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">
                Nouveau mot de passe{' '}
                <span className="text-muted font-normal">(laisser vide pour ne pas changer)</span>
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="Minimum 8 caractères"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            {isSuccess && (
              <p className="text-sm text-green-700 bg-green-50 px-3 py-2">
                Profil mis à jour avec succès.
              </p>
            )}
            {isError && (
              <p className="text-sm text-red-600">Une erreur est survenue.</p>
            )}

            <Button type="submit" disabled={isPending || !isDirty} className="self-start">
              {isPending ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </form>
        )}

        <div className="mt-8 pt-8 border-t border-border">
          <p className="text-sm text-muted">
            Rôle :{' '}
            <span className="font-medium text-ink capitalize">{me?.role ?? '—'}</span>
          </p>
        </div>
      </div>
    </Layout>
  )
}
