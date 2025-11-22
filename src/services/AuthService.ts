import type { AxiosResponse } from 'axios'
import $api from '@/shared/api/http'
import type { AuthResponse } from '@/models/response/AuthResponse'

export default class AuthService {
  static async login(email: string, password: string): Promise<AxiosResponse<AuthResponse>> {
    return $api.post<AuthResponse>('/auth/login', { email, password })
  }

  static async registration(username: string, email: string, password: string): Promise<AxiosResponse<AuthResponse>> {
    return $api.post<AuthResponse>('/auth/register', { username, email, password })
  }

  static async logout(): Promise<void> {
    return $api.post('/auth/logout')
  }
}
