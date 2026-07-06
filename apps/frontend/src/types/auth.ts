
export interface AuthUser {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
}

export interface AuthResponse {
  user: AuthUser
  accessToken: string
  refreshToken: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
}
