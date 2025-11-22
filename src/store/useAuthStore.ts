import { create } from 'zustand'
import axios from 'axios'
import { API_URL } from '@/shared/api/http'
import AuthService from '@/services/AuthService'
import type { IUser } from '@/models/IUser'
import type { AuthResponse } from '@/models/response/AuthResponse'

interface AuthState {
  user: IUser | null
  isAuth: boolean
  isLoading: boolean

  setAuth: (state: boolean) => void
  setUser: (user: IUser | null) => void
  setLoading: (state: boolean) => void

  login: (email: string, password: string) => Promise<IUser | null>
  register: (name: string, email: string, password: string) => Promise<IUser | null>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuth: false,
  isLoading: true,

  setAuth: (state) => set({ isAuth: state }),
  setUser: (user) => set({ user }),
  setLoading: (state) => set({ isLoading: state }),

  // when backend is ready - this is real login
  login: async (email, password) => {
    try {
      const response = await AuthService.login(email, password)
      localStorage.setItem('token', response.data.accessToken)

      set({
        isAuth: true,
        user: response.data.user,
      })

      return response.data.user
    } catch (e: any) {
      console.log(e.response?.data?.message)
      return null
    }
  },

  register: async (name, email, password) => {
    try {
      const response = await AuthService.registration(name, email, password)
      localStorage.setItem('token', response.data.accessToken)

      set({
        isAuth: true,
        user: response.data.user,
      })

      return response.data.user
    } catch (e: any) {
      console.log(e.response?.data?.message)
      return null
    }
  },

  logout: async () => {
    try {
      await AuthService.logout()
      localStorage.removeItem('token')

      set({
        isAuth: false,
        user: null,
        isLoading: false,
      })

      window.location.href = '/'
    } catch (e: any) {
      console.log(e.response?.data?.message)
    }
  },

  checkAuth: async () => {
    try {
      const response = await axios.get<AuthResponse>(`${API_URL}/auth/refresh`, {
        withCredentials: true,
      })

      localStorage.setItem('token', response.data.accessToken)

      set({
        isAuth: true,
        user: response.data.user,
      })
    } catch (e: any) {
      console.log(e.response?.data?.message)
    } finally {
      set({ isLoading: false })
    }
  },
}))
