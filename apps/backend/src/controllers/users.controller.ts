import { type Request, type Response } from 'express'
import { updateUserSchema } from '../schemas/users'
import { getUserById, updateUser } from '../services/users/users.service'
import type { ApiResponse } from '../types'

export async function getOneUser(req: Request, res: Response){
  const user = await getUserById(req.user!.id)

  // Exclure le password et le googleId de la réponse
  const { password: _password, googleId: _googleId, ...safeUser } = user

  const response: ApiResponse = { success: true, data: safeUser }
  res.json(response)
}

export async function putOneUser(req: Request, res: Response){
  const parsed = updateUserSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ success: false, error: 'Données invalides', details: parsed.error.flatten() })
    return
  }

  const user = await updateUser(req.user!.id, parsed.data)

  const response: ApiResponse = { success: true, data: user, message: 'Profil mis à jour' }
  res.json(response)
}
