// useAuthStore.ts
import { create } from "zustand";
import axios from "axios";
import { API_URL } from "@/shared/api/http";
import AuthService from "@/services/AuthService";
import type { IUser } from "@/models/IUser";
import type { AuthResponse } from "@/models/response/AuthResponse";

interface AuthState {
  user: IUser | null;
  isAuth: boolean;
  isLoading: boolean;

  setAuth: (state: boolean) => void;
  setUser: (user: IUser | null) => void;
  setLoading: (state: boolean) => void;

  login: (email: string, password: string) => Promise<IUser | null>;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<IUser | null>;
  logout: () => Promise<void>;

  // было: checkAuth: () => Promise<void>
  checkAuth: () => Promise<IUser | null>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuth: false,
  isLoading: true,

  setAuth: (state) => set({ isAuth: state }),
  setUser: (user) => set({ user }),
  setLoading: (state) => set({ isLoading: state }),

  login: async (email, password) => {
    const response = await AuthService.login(email, password);

    // если сюда дошли - запрос успешный (2xx)
    localStorage.setItem("token", response.data.accessToken);
    localStorage.removeItem("loggedOut");

    set({
      isAuth: true,
      user: response.data.user,
    });

    return response.data.user;
  },

  register: async (name, email, password) => {
    const response = await AuthService.registration(name, email, password);

    localStorage.setItem("token", response.data.accessToken);
    localStorage.removeItem("loggedOut");

    set({
      isAuth: true,
      user: response.data.user,
    });

    return response.data.user;
  },
  // Чисто фронтовый logout
  logout: async () => {
    try {
      await AuthService.logout(); // сейчас пусто, на будущее
    } finally {
      localStorage.removeItem("token");
      localStorage.setItem("loggedOut", "true");

      set({
        isAuth: false,
        user: null,
        isLoading: false,
      });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });

    try {
      const response = await axios.get<AuthResponse>(
        `${API_URL}/auth/refresh`,
        {
          withCredentials: true,
        }
      );

      localStorage.setItem("token", response.data.accessToken);

      const user = response.data.user;

      set({
        isAuth: true,
        user,
      });

      return user; // IUser
    } catch (e: any) {
      console.log("checkAuth error:", e.response?.data || e.message);

      set({
        isAuth: false,
        user: null,
      });

      return null; // при ошибке возвращаем null
    } finally {
      set({ isLoading: false });
    }
  },
}));
