import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { requireAdmin } from '@/lib/auth-guard'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  useEvents,
  useCreateEvent,
  useDeleteEvent,
  eventsApi,
  eventKeys,
} from '@/api/events.api'
import type { Event, CreateEventPayload } from '@/api/events.api'
import type { EventType } from '@/types'

const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: 'exposition', label: 'Exposition' },
  { value: 'conference', label: 'Conférence' },
  { value: 'atelier', label: 'Atelier' },
  { value: 'rencontre', label: 'Rencontre' },
]

const eventSchema = z.object({
  title: z.string().min(1, 'Titre requis'),
  description: z.string().min(1, 'Description requise'),
  type: z.enum(['exposition', 'conference', 'atelier', 'rencontre']),
  location: z.string().min(1, 'Lieu requis'),
  date: z.string().min(1, 'Date requise'),
  totalSeats: z.number().int().positive('Nombre de places invalide'),
  imageUrl: z.string().optional(),
})

type EventFormData = z.infer<typeof eventSchema>

type DialogMode = 'create' | 'edit' | 'delete' | null

function isoToDatetimeLocal(iso: string) {
  return iso.slice(0, 16)
}

const FORM_DEFAULTS: EventFormData = {
  title: '',
  description: '',
  type: 'exposition',
  location: '',
  date: '',
  totalSeats: 50,
  imageUrl: '',
}

function AdminPage() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useEvents({ limit: 100 })

  const createMutation = useCreateEvent()
  const deleteMutation = useDeleteEvent()
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateEventPayload> }) =>
      eventsApi.update(id, payload),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
      void queryClient.invalidateQueries({ queryKey: eventKeys.detail(id) })
    },
  })

  const [mode, setMode] = useState<DialogMode>(null)
  const [target, setTarget] = useState<Event | null>(null)

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: FORM_DEFAULTS,
  })

  function openCreate() {
    form.reset(FORM_DEFAULTS)
    setTarget(null)
    setMode('create')
  }

  function openEdit(event: Event) {
    form.reset({
      title: event.title,
      description: event.description,
      type: event.type,
      location: event.location,
      date: isoToDatetimeLocal(event.date),
      totalSeats: event.totalSeats,
      imageUrl: event.imageUrl ?? '',
    })
    setTarget(event)
    setMode('edit')
  }

  function openDelete(event: Event) {
    setTarget(event)
    setMode('delete')
  }

  function closeDialog() {
    setMode(null)
    setTarget(null)
  }

  async function onSubmit(formData: EventFormData) {
    const payload: CreateEventPayload = {
      title: formData.title,
      description: formData.description,
      type: formData.type,
      location: formData.location,
      date: new Date(formData.date).toISOString(),
      totalSeats: formData.totalSeats,
      imageUrl: formData.imageUrl || undefined,
    }
    if (mode === 'create') {
      await createMutation.mutateAsync(payload)
    } else if (mode === 'edit' && target) {
      await updateMutation.mutateAsync({ id: target.id, payload })
    }
    closeDialog()
  }

  async function confirmDelete() {
    if (!target) return
    await deleteMutation.mutateAsync(target.id)
    closeDialog()
  }

  const events = data?.data ?? []
  const total = data?.total ?? 0
  const isFormPending = createMutation.isPending || updateMutation.isPending

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl text-ink">Administration</h1>
            <p className="text-muted mt-1">
              {total} événement{total !== 1 ? 's' : ''}
            </p>
          </div>
          <Button onClick={openCreate}>
            <Plus size={16} className="mr-2" />
            Nouvel événement
          </Button>
        </div>

        {/* Events table */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 bg-surface animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto border border-border">
            <table className="w-full text-sm">
              <thead className="bg-surface">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted">Titre</th>
                  <th className="text-left px-4 py-3 font-medium text-muted">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-muted">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-muted">Places</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {events.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted">
                      Aucun événement
                    </td>
                  </tr>
                ) : (
                  events.map((event) => (
                    <tr key={event.id} className="hover:bg-surface/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-ink">{event.title}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{event.type}</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {new Date(event.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {event.availableSeats}/{event.totalSeats}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(event)}
                            className="p-1.5 hover:bg-surface text-muted hover:text-ink transition-colors"
                            aria-label="Modifier"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => openDelete(event)}
                            className="p-1.5 hover:bg-red-50 text-muted hover:text-red-600 transition-colors"
                            aria-label="Supprimer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit dialog */}
      <Dialog
        open={mode === 'create' || mode === 'edit'}
        onOpenChange={(open) => {
          if (!open) closeDialog()
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {mode === 'create' ? 'Nouvel événement' : "Modifier l'événement"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div>
              <Label htmlFor="adm-title">Titre</Label>
              <Input id="adm-title" {...form.register('title')} className="mt-1" />
              {form.formState.errors.title && (
                <p className="text-red-600 text-xs mt-1">{form.formState.errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="adm-description">Description</Label>
              <textarea
                id="adm-description"
                rows={3}
                {...form.register('description')}
                className="mt-1 w-full border border-border bg-canvas px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-cobalt focus:border-transparent resize-none"
              />
              {form.formState.errors.description && (
                <p className="text-red-600 text-xs mt-1">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="adm-type">Type</Label>
                <select
                  id="adm-type"
                  {...form.register('type')}
                  className="mt-1 w-full border border-border bg-canvas px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-cobalt h-10"
                >
                  {EVENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="adm-seats">Places</Label>
                <Input
                  id="adm-seats"
                  type="number"
                  min={1}
                  {...form.register('totalSeats', { valueAsNumber: true })}
                  className="mt-1"
                />
                {form.formState.errors.totalSeats && (
                  <p className="text-red-600 text-xs mt-1">
                    {form.formState.errors.totalSeats.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="adm-location">Lieu</Label>
              <Input id="adm-location" {...form.register('location')} className="mt-1" />
            </div>

            <div>
              <Label htmlFor="adm-date">Date</Label>
              <Input
                id="adm-date"
                type="datetime-local"
                {...form.register('date')}
                className="mt-1"
              />
              {form.formState.errors.date && (
                <p className="text-red-600 text-xs mt-1">{form.formState.errors.date.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="adm-image">Image URL (optionnel)</Label>
              <Input
                id="adm-image"
                {...form.register('imageUrl')}
                placeholder="https://..."
                className="mt-1"
              />
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Annuler
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isFormPending}>
                {isFormPending ? 'Enregistrement…' : mode === 'create' ? 'Créer' : 'Enregistrer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={mode === 'delete'}
        onOpenChange={(open) => {
          if (!open) closeDialog()
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer l'événement</DialogTitle>
          </DialogHeader>
          <p className="text-muted text-sm">
            Êtes-vous sûr de vouloir supprimer{' '}
            <strong className="text-ink">{target?.title}</strong> ? Cette action est irréversible.
          </p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Suppression…' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  )
}

export const Route = createFileRoute('/admin/')({
  beforeLoad: requireAdmin,
  component: AdminPage,
})
