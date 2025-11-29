import type { AxiosResponse } from 'axios'
import $api from '@/shared/api/http'
import type { AuthResponse } from '@/models/response/AuthResponse'

export default class AuthService {
  static async login(email: string, password: string): Promise<AxiosResponse<AuthResponse>> {
    return $api.post<AuthResponse>('/auth/login', { email, password })
  }

  static async registration(
    username: string,
    email: string,
    password: string,
  ): Promise<AxiosResponse<AuthResponse>> {
    return $api.post<AuthResponse>('/auth/register', {
      username,
      email,
      password,
      role: 'user',
    })
  }

  static async logout(): Promise<void> {
    // пока бэк не сделает endpoint - ничего не делаем
    return Promise.resolve();
  }
}
