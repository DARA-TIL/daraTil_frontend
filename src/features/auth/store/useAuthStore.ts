import { create } from "zustand";
import type { IUser } from "@/features/auth/model/IUser";
import AuthService from "@/features/auth/api/AuthService";
import $api from "@/shared/api/http";
import { useUiStore } from "../../../shared/store/useUiStore";
import ProfileService from "@/features/profile/api/ProfileService";
import type {
  AuthResponse,
  AuthPayload,
} from "@/features/auth/model/response/AuthResponse";

function unwrapAuth(payload: AuthResponse | any): AuthPayload | any {
  return payload?.data ?? payload;
}

function extractAccessToken(payload: AuthResponse | any): string | null {
  const p = unwrapAuth(payload);
  return (p?.accessToken ?? null) as string | null;
}

function extractRefreshToken(payload: AuthResponse | any): string | null {
  const p = unwrapAuth(payload);
  return (p?.refreshToken ?? null) as string | null;
}

function normalizeUserFromBackend(payload: any): IUser | null {
  if (!payload) return null;

  const root = unwrapAuth(payload);
  const u = root?.user ?? root?.data?.user ?? root;
  if (!u || typeof u !== "object") return null;

  const p = u.progress ?? u.Progress ?? null;
  const st = u.streak ?? u.Streak ?? null;
  const streakStatus = root?.streak ?? payload?.streak ?? null;

  return {
    id: u.id ?? u.ID ?? 0,
    username: u.username ?? u.Username ?? "",
    email: u.email ?? u.Email ?? "",
    avatar: u.avatar ?? u.Avatar ?? "",
    role: u.role ?? u.Role ?? "",
    authProvider: u.authProvider ?? u.AuthProvider ?? "",
    streakStatus: typeof streakStatus === "string" ? streakStatus : "",
    progress: p
      ? {
          id: p.id ?? p.ID ?? 0,
          level: p.level ?? p.Level ?? 0,
          xpTotal: p.XpTotal ?? p.xpTotal ?? 0,
          xpForNextLevel: p.XpForNextLevel ?? p.xpForNextLevel ?? 1,
          userID: p.userID ?? p.UserID ?? 0,
        }
      : null,
    streak: st
      ? {
          id: st.id ?? st.ID ?? 0,
          userID: st.userID ?? st.UserID ?? 0,
          currentStreak: st.currentStreak ?? st.CurrentStreak ?? 0,
          longestStreak: st.longestStreak ?? st.LongestStreak ?? 0,
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
      // 1) пробуем /auth/me (если токен валиден - сразу ok)
      try {
        const meResponse = await $api.get("/auth/me");
        const user = normalizeUserFromBackend(meResponse.data);

        if (user) {
          set({ isAuth: true, user });
          return user;
        }
      } catch (err: any) {
        // ничего не удаляем по тексту ошибки
        // просто пробуем refresh ниже
      }

      // 2) пробуем refresh (cookie httpOnly)
      try {
        const refreshRes = await $api.get("/auth/refresh");
        const token = extractAccessToken(refreshRes.data);

        if (token) {
          localStorage.setItem("token", token);
          localStorage.removeItem("loggedOut");
        }

        // refresh может вернуть user, а может нет - подстрахуемся
        const userFromRefresh = normalizeUserFromBackend(refreshRes.data);
        if (userFromRefresh) {
          set({ isAuth: true, user: userFromRefresh });
          return userFromRefresh;
        }

        // 3) если refresh без user - снова /auth/me
        const meResponse2 = await $api.get("/auth/me");
        const user2 = normalizeUserFromBackend(meResponse2.data);

        set({ isAuth: Boolean(user2), user: user2 });
        return user2;
      } catch (refreshErr: any) {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
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

      const accessToken = extractAccessToken(response.data);
      if (accessToken) {
        localStorage.setItem("token", accessToken);
        localStorage.removeItem("loggedOut");
      }

      const refreshToken = extractRefreshToken(response.data);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);

      const user = normalizeUserFromBackend(response.data);
      set({ isAuth: Boolean(user), user });

      return user;
    },

    register: async (name, email, password) => {
      const response = await AuthService.registration(name, email, password);

      const accessToken = extractAccessToken(response.data);
      if (accessToken) {
        localStorage.setItem("token", accessToken);
        localStorage.removeItem("loggedOut");
      }

      const refreshToken = extractRefreshToken(response.data);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);

      const user = normalizeUserFromBackend(response.data);
      set({ isAuth: Boolean(user), user });

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

        set({ isAuth: false, user: null, isLoading: false });

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
