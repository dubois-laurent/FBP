// Types liés à l'authentification et aux payloads JWT

export interface JwtAccessPayload {
  sub: string
  email: string
  role: 'user' | 'admin'
  type: 'access'
}

export interface JwtRefreshPayload {
  sub: string
  type: 'refresh'
}

// req.user
export interface AuthUser {
  id: string
  email: string
  role: 'user' | 'admin'
}
