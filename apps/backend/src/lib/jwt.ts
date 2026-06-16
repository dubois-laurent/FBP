import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import type { JwtAccessPayload, JwtRefreshPayload } from '../types/auth'

export function signAccessToken(payload: Omit<JwtAccessPayload, 'type'>): string {
  return jwt.sign(
    { ...payload, type: 'access' } satisfies JwtAccessPayload,
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'] },
  )
}

export function signRefreshToken(userId: string): string {
  return jwt.sign(
    { sub: userId, type: 'refresh' } satisfies JwtRefreshPayload,
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'] },
  )
}


export function verifyAccessToken(token: string): JwtAccessPayload {
  const payload = jwt.verify(token, env.JWT_ACCESS_SECRET)
  if (typeof payload === 'string' || payload.type !== 'access') {
    throw new jwt.JsonWebTokenError('Invalid access token type')
  }
  return payload as JwtAccessPayload
}


export function verifyRefreshToken(token: string): JwtRefreshPayload {
  const payload = jwt.verify(token, env.JWT_REFRESH_SECRET)
  if (typeof payload === 'string' || payload.type !== 'refresh') {
    throw new jwt.JsonWebTokenError('Invalid refresh token type')
  }
  return payload as JwtRefreshPayload
}
