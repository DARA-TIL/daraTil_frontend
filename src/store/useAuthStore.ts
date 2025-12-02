// src/store/useAuthStore.ts
import { create } from "zustand";
import type { IUser } from "@/models/IUser";
import type { AuthResponse } from "@/models/response/AuthResponse";
import AuthService from "@/services/AuthService";
import $api from "@/shared/api/http";
import { useUiStore } from "./useUiStore";

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
  checkAuth: () => Promise<IUser | null>;
}

export const useAuthStore = create<AuthState>((set) => {
  // чтобы несколько вызовов checkAuth не создавали несколько HTTP-запросов
  let checkAuthPromise: Promise<IUser | null> | null = null;

  const doCheckAuth = async (): Promise<IUser | null> => {
    set({ isLoading: true });

    try {
      // используем $api, не голый axios
      const response = await $api.get<AuthResponse>("/auth/refresh");

      const { accessToken, user } = response.data;

      localStorage.setItem("token", accessToken);
      localStorage.removeItem("loggedOut");

      set({
        isAuth: true,
        user,
      });

      return user;
    } catch (e: any) {
      console.log("checkAuth error:", e.response?.data || e.message);

      set({
        isAuth: false,
        user: null,
      });

      return null;
    } finally {
      set({ isLoading: false });
    }
  };

  return {
    user: null,
    isAuth: false,
    isLoading: true,

    setAuth: (state) => set({ isAuth: state }),
    setUser: (user) => set({ user }),
    setLoading: (state) => set({ isLoading: state }),

    // обычный логин
    login: async (email, password) => {
      const response = await AuthService.login(email, password);

      localStorage.setItem("token", response.data.accessToken);
      localStorage.removeItem("loggedOut");

      set({
        isAuth: true,
        user: response.data.user,
      });

      return response.data.user;
    },

    // обычная регистрация
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

    // logout - дергаем бэк, но даже если он упал, всё равно чистим стейт
    logout: async () => {
      try {
        await AuthService.logout();
      } catch (e: any) {
        console.log("logout error:", e.response?.data || e.message);
      } finally {
        localStorage.removeItem("token");
        localStorage.setItem("loggedOut", "true");

        set({
          isAuth: false,
          user: null, 
          isLoading: false,
        });

        useUiStore
          .getState()
          .showSnackbar("Logged out successfully", "success");
      }
    },

    // checkAuth - только через один промис
    checkAuth: async () => {
      if (!checkAuthPromise) {
        checkAuthPromise = doCheckAuth().finally(() => {
          checkAuthPromise = null;
        });
      }
      return checkAuthPromise;
    },
  };
});
