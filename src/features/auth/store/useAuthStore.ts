// src/store/useAuthStore.ts
import { create } from "zustand";
import type { IUser } from "@/features/auth/model/IUser";
import AuthService from "@/features/auth/api/AuthService";
import $api from "@/shared/api/http";
import { useUiStore } from "../../../shared/store/useUiStore";
import ProfileService from "@/features/profile/api/ProfileService";

function normalizeUserFromBackend(payload: any): IUser | null {
  if (!payload) return null;

  const u = payload.user ?? payload.data?.user ?? payload.data ?? payload;
  if (!u || typeof u !== "object") return null;

  const p = u.progress ?? u.Progress ?? null;

  return {
    id: u.id ?? u.ID ?? 0,
    username: u.username ?? u.Username ?? "",
    email: u.email ?? u.Email ?? "",
    avatar: u.avatar ?? u.Avatar ?? "",
    role: u.role ?? u.Role ?? "",
    authProvider: u.authProvider ?? u.AuthProvider ?? "",
    progress: p
      ? {
          id: p.id ?? p.ID ?? 0,
          level: p.level ?? p.Level ?? 0,
          xpTotal: p.XpTotal ?? p.xpTotal ?? 0,
          xpForNextLevel: p.XpForNextLevel ?? p.xpForNextLevel ?? 1,
          userID: p.userID ?? p.UserID ?? 0,
        }
      : null,
  };
}

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
    password: string,
  ) => Promise<IUser | null>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<IUser | null>;
  updateProfile: (data: {
    avatar?: string;
    password?: string;
    username?: string;
  }) => Promise<IUser | null>;
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
          const meResponse = await $api.get("/auth/me");
          const user = normalizeUserFromBackend(meResponse.data);

          if (user) {
            set({ isAuth: true, user });
            return user;
          }

          set({ isAuth: false, user: null });
          return null;
        } catch (err: any) {
          const status = err.response?.status;
          const errorMessage =
            err.response?.data?.error || err.response?.data?.message;

          console.log(
            "checkAuth /auth/me error:",
            err.response?.data || err.message,
          );

          const isTokenExpired =
            status === 401 &&
            typeof errorMessage === "string" &&
            errorMessage.toLowerCase().includes("token expired");

          // если токен НЕ просто истёк - значит что-то другое, сбрасываем
          if (!isTokenExpired) {
            localStorage.removeItem("token");
            set({ isAuth: false, user: null });
            return null;
          }

          console.log(
            "checkAuth: access token expired, trying /auth/refresh...",
          );
        }
      }

      // 2) либо токена нет, либо он истек - пробуем /auth/refresh
      try {
        const refreshToken = localStorage.getItem("refreshToken");

        const refreshResponse = await $api.post(
          "/auth/refresh",
          refreshToken ? { refreshToken } : {},
        );

        const accessToken = refreshResponse.data?.accessToken;
        const user = normalizeUserFromBackend(refreshResponse.data);

        if (accessToken) {
          localStorage.setItem("token", accessToken);
          localStorage.removeItem("loggedOut");
        }

        set({
          isAuth: Boolean(user),
          user,
        });

        return user;
      } catch (refreshErr: any) {
        console.log(
          "checkAuth /auth/refresh error:",
          refreshErr.response?.data || refreshErr.message,
        );

        localStorage.removeItem("token");
        set({ isAuth: false, user: null });
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

      const accessToken = response.data?.accessToken;
      if (accessToken) {
        localStorage.setItem("token", accessToken);
        localStorage.removeItem("loggedOut");
      }

      const refreshToken = response.data?.refreshToken;
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);

      const user = normalizeUserFromBackend(response.data);
      set({
        isAuth: Boolean(user),
        user,
      });

      return user;
    },

    register: async (name, email, password) => {
      const response = await AuthService.registration(name, email, password);

      const accessToken = response.data?.accessToken;
      if (accessToken) {
        localStorage.setItem("token", accessToken);
        localStorage.removeItem("loggedOut");
      }

      const refreshToken = response.data?.refreshToken;
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);

      const user = normalizeUserFromBackend(response.data);
      set({
        isAuth: Boolean(user),
        user,
      });

      return user;
    },

    logout: async () => {
      try {
        await AuthService.logout();
      } catch (e: any) {
        console.log("logout error:", e.response?.data || e.message);
      } finally {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
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

    checkAuth: async () => {
      if (!checkAuthPromise) {
        checkAuthPromise = doCheckAuth().finally(() => {
          checkAuthPromise = null;
        });
      }
      return checkAuthPromise;
    },

    updateProfile: async (data) => {
      try {
        const updated = await ProfileService.updateSelf(data);
        set({ user: updated });
        useUiStore.getState().showSnackbar("Profile updated", "success");
        return updated;
      } catch (e) {
        useUiStore.getState().showSnackbar("Failed to update profile", "error");
        return null;
      }
    },
  };
});
