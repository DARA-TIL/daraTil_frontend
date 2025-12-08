import type { IUser } from '@/features/auth/model/IUser'

export interface AuthResponse {
  accessToken: string
  refreshToken?: string
  user: IUser
}
