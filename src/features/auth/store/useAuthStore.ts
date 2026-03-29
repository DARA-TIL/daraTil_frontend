import { create } from "zustand";
import type { IUser, IUserStreak } from "@/features/auth/model/IUser";
import AuthService from "@/features/auth/api/AuthService";
import $api from "@/shared/api/http";
import { useUiStore } from "../../../shared/store/useUiStore";
import ProfileService from "@/features/profile/api/ProfileService";
import type {
  AuthResponse,
  AuthPayload,
} from "@/features/auth/model/response/AuthResponse";
import {
  parseStreakStatus,
  toCanonicalStreakStatus,
  type StreakStatusKind,
} from "@/features/auth/model/streak";

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
    streakStatus:
      typeof streakStatus === "string"
        ? toCanonicalStreakStatus(streakStatus)
        : "",
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
          userID: st.userID ?? st.UserID ?? u.id ?? u.ID ?? 0,
          currentStreak: st.currentStreak ?? st.CurrentStreak ?? 0,
          longestStreak: st.longestStreak ?? st.LongestStreak ?? 0,
        }
      : null,
  };
}

function isActionableStreakKind(kind: StreakStatusKind): boolean {
  return (
    kind === "incremented" ||
    kind === "reset" ||
    kind === "created" ||
    kind === "new_start"
  );
}

function normalizeStreak(
  userID: number,
  streak: IUserStreak | null | undefined,
): IUserStreak {
  return {
    id: streak?.id ?? 0,
    userID: streak?.userID ?? userID,
    currentStreak: Math.max(0, streak?.currentStreak ?? 0),
    longestStreak: Math.max(0, streak?.longestStreak ?? 0),
  };
}

function applyStreakKind(streak: IUserStreak, kind: StreakStatusKind): IUserStreak {
  let currentStreak = streak.currentStreak;

  if (kind === "reset") {
    currentStreak = 0;
  } else if (kind === "incremented") {
    currentStreak += 1;
  } else if (kind === "created" || kind === "new_start") {
    currentStreak = 1;
  }

  return {
    ...streak,
    currentStreak,
    longestStreak: Math.max(streak.longestStreak, currentStreak),
  };
}

interface AuthState {
  user: IUser | null;
  isAuth: boolean;
  isLoading: boolean;
  streakEventToken: number;

  setAuth: (state: boolean) => void;
  setUser: (user: IUser | null) => void;
  setLoading: (state: boolean) => void;
  applyStreakUpdate: (status?: string | null) => void;

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

  const setUserWithStreakEvent = (user: IUser | null, isAuth: boolean) => {
    const kind = parseStreakStatus(user?.streakStatus);

    set((state) => ({
      isAuth,
      user,
      streakEventToken: isActionableStreakKind(kind)
        ? state.streakEventToken + 1
        : state.streakEventToken,
    }));
  };

  const doCheckAuth = async (): Promise<IUser | null> => {
    set({ isLoading: true });

    try {
      try {
        const meResponse = await $api.get("/auth/me", {
          skipAuthRefresh: true,
        } as any);
        const user = normalizeUserFromBackend(meResponse.data);

        if (user) {
          setUserWithStreakEvent(user, true);
          return user;
        }
      } catch (err: any) {
        // ignore and continue with refresh flow
      }

      try {
        const refreshRes = await $api.get("/auth/refresh");
        const token = extractAccessToken(refreshRes.data);

        if (token) {
          localStorage.setItem("token", token);
          localStorage.removeItem("loggedOut");
        }

        const userFromRefresh = normalizeUserFromBackend(refreshRes.data);
        if (userFromRefresh) {
          setUserWithStreakEvent(userFromRefresh, true);
          return userFromRefresh;
        }

        const meResponse2 = await $api.get("/auth/me", {
          skipAuthRefresh: true,
        } as any);
        const user2 = normalizeUserFromBackend(meResponse2.data);

        setUserWithStreakEvent(user2, Boolean(user2));
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
    streakEventToken: 0,

    setAuth: (state) => set({ isAuth: state }),
    setUser: (user) => set({ user }),
    setLoading: (state) => set({ isLoading: state }),

    applyStreakUpdate: (status) =>
      set((state) => {
        const user = state.user;
        if (!user || !status) return {};

        const kind = parseStreakStatus(status);
        const canonicalStatus = toCanonicalStreakStatus(status);

        if (kind === "unknown") {
          return {
            user: { ...user, streakStatus: canonicalStatus || user.streakStatus },
          };
        }

        if (kind === "no_change") {
          return {
            user: { ...user, streakStatus: canonicalStatus || "NoChange" },
          };
        }

        const baseStreak = normalizeStreak(user.id, user.streak);
        const nextStreak = applyStreakKind(baseStreak, kind);

        return {
          user: {
            ...user,
            streakStatus: canonicalStatus,
            streak: nextStreak,
          },
          streakEventToken: state.streakEventToken + 1,
        };
      }),

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
      setUserWithStreakEvent(user, Boolean(user));

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
      setUserWithStreakEvent(user, Boolean(user));

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
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                ...updated,
                streak: updated.streak ?? state.user.streak ?? null,
                streakStatus:
                  updated.streakStatus ?? state.user.streakStatus ?? "",
              }
            : updated,
        }));
        useUiStore.getState().showSnackbar("Profile updated", "success");
        return updated;
      } catch (e) {
        useUiStore.getState().showSnackbar("Failed to update profile", "error");
        return null;
      }
    },
  };
});
