// src/shared/api/http.ts
import axios from 'axios'
import type { AuthResponse } from '@/models/response/AuthResponse'

export const API_URL = 'https://daratilback.onrender.com/api'

const $api = axios.create({
  withCredentials: true,
  baseURL: API_URL,
})

$api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

$api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as any

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        // refresh токена
        const response = await axios.get<AuthResponse>(`${API_URL}/auth/refresh`, {
          withCredentials: true,
        })

        localStorage.setItem('token', response.data.accessToken)
        $api.defaults.headers.common.Authorization = `Bearer ${response.data.accessToken}`

        return $api(originalRequest)
      } catch {
        localStorage.setItem('lastPage', window.location.pathname)
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  },
)

export default $api
