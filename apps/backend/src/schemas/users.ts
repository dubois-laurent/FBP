import { z } from 'zod'

export const updateUserSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  password: z
    .string()
    .min(6)
    .max(72)
    .optional(),
})

export type UpdateUserInput = z.infer<typeof updateUserSchema>
