// src/store/useAuthStore.ts
import { create } from "zustand";
import type { IUser } from "@/features/auth/model/IUser";
import type { AuthResponse } from "@/features/auth/model/response/AuthResponse";
import AuthService from "@/features/auth/api/AuthService";
import $api from "@/shared/api/http";
import { useUiStore } from "../../../shared/store/useUiStore";

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
  let checkAuthPromise: Promise<IUser | null> | null = null;

  const doCheckAuth = async (): Promise<IUser | null> => {
    set({ isLoading: true });

    try {
      const token = localStorage.getItem("token");

      // 1) если есть access токен - сначала пробуем /auth/me
      if (token) {
        try {
          const meResponse = await $api.get<IUser>("/auth/me");
          const user = meResponse.data;

          set({
            isAuth: true,
            user,
          });

          return user;
        } catch (err: any) {
          const status = err.response?.status;
          const errorMessage =
            err.response?.data?.error || err.response?.data?.message;

          console.log(
            "checkAuth /auth/me error:",
            err.response?.data || err.message
          );

          const isTokenExpired =
            status === 401 &&
            typeof errorMessage === "string" &&
            errorMessage.toLowerCase().includes("token expired");

          // если токен просто истек - пробуем рефреш ниже
          if (!isTokenExpired) {
            localStorage.removeItem("token");

            set({
              isAuth: false,
              user: null,
            });

            return null;
          }

          console.log("checkAuth: access token expired, trying /auth/refresh...");
        }
      }

      // 2) либо токена нет, либо он истек - пробуем /auth/refresh
      try {
        const refreshResponse = await $api.get<AuthResponse>("/auth/refresh");
        const { accessToken, user } = refreshResponse.data;

        localStorage.setItem("token", accessToken);
        localStorage.removeItem("loggedOut"); // можешь вообще перестать использовать этот флаг

        set({
          isAuth: true,
          user,
        });

        return user;
      } catch (refreshErr: any) {
        console.log(
          "checkAuth /auth/refresh error:",
          refreshErr.response?.data || refreshErr.message
        );

        localStorage.removeItem("token");

        set({
          isAuth: false,
          user: null,
        });

        return null;
      }
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

    logout: async () => {
      try {
        await AuthService.logout();
      } catch (e: any) {
        console.log("logout error:", e.response?.data || e.message);
      } finally {
        localStorage.removeItem("token");
        localStorage.setItem("loggedOut", "true"); // можешь оставить для аналитики, но логика checkAuth больше на него не смотрит

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
