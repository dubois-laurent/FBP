import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(2).max(255),
  email: z.string().email(),
  password: z
    .string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
    .max(72, 'Le mot de passe ne peut pas dépasser 72 caractères'), // Pour bcrypt, le mot de passe ne peut pas dépasser 72 caractères
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
})

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type RefreshInput = z.infer<typeof refreshSchema>
