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
import { getRecord, isRecord, unwrapApiData } from "@/shared/lib/unknownRecord";
import i18n from "@/shared/config/i18n/i18n";
import type {
  Subscription,
  SubscriptionPlan,
} from "@/features/subscriptions/model/types";

function unwrapAuth(payload: AuthResponse | unknown): AuthPayload | unknown {
  return unwrapApiData(payload);
}

function extractAccessToken(payload: AuthResponse | unknown): string | null {
  const p = unwrapAuth(payload);
  if (!isRecord(p)) return null;
  return typeof p.accessToken === "string" ? p.accessToken : null;
}

function extractRefreshToken(payload: AuthResponse | unknown): string | null {
  const p = unwrapAuth(payload);
  if (!isRecord(p)) return null;
  return typeof p.refreshToken === "string" ? p.refreshToken : null;
}

function normalizeSubscriptionPlan(payload: unknown): SubscriptionPlan | null {
  if (!isRecord(payload)) return null;

  return {
    id: Number(payload.id ?? payload.ID ?? 0),
    name: String(payload.name ?? payload.Name ?? ""),
    description:
      typeof (payload.description ?? payload.Description) === "string"
        ? String(payload.description ?? payload.Description)
        : null,
    price: Number(payload.price ?? payload.Price ?? 0),
    durationDays: Number(payload.durationDays ?? payload.DurationDays ?? 0),
    isActive: Boolean(payload.isActive ?? payload.IsActive),
    createdAt: String(payload.createdAt ?? payload.CreatedAt ?? ""),
    updatedAt: String(payload.updatedAt ?? payload.UpdatedAt ?? ""),
  };
}

function normalizeSubscription(payload: unknown): Subscription | null {
  if (!isRecord(payload)) return null;

  const plan = payload.plan ?? payload.Plan;

  return {
    id: Number(payload.id ?? payload.ID ?? 0),
    userId: Number(payload.userId ?? payload.UserID ?? 0),
    status: String(payload.status ?? payload.Status ?? ""),
    planId: Number(payload.planId ?? payload.PlanID ?? 0),
    plan: normalizeSubscriptionPlan(plan),
    activeUntil: String(payload.activeUntil ?? payload.ActiveUntil ?? ""),
    cancelledAt:
      typeof (payload.cancelledAt ?? payload.CancelledAt) === "string"
        ? String(payload.cancelledAt ?? payload.CancelledAt)
        : null,
    createdAt: String(payload.createdAt ?? payload.CreatedAt ?? ""),
    updatedAt: String(payload.updatedAt ?? payload.UpdatedAt ?? ""),
  };
}

function normalizeUserFromBackend(payload: unknown): IUser | null {
  if (!payload) return null;

  const root = unwrapAuth(payload);
  if (!isRecord(root)) return null;

  const u = getRecord(root, "user") ?? getRecord(getRecord(root, "data"), "user") ?? root;

  const p = getRecord(u, "progress") ?? getRecord(u, "Progress");
  const st = getRecord(u, "streak") ?? getRecord(u, "Streak");
  const subscription = u.subscription ?? u.Subscription;
  const streakStatus = root.streak;

  return {
    id: Number(u.id ?? u.ID ?? 0),
    username: String(u.username ?? u.Username ?? ""),
    email: String(u.email ?? u.Email ?? ""),
    avatar: String(u.avatar ?? u.Avatar ?? ""),
    role: String(u.role ?? u.Role ?? ""),
    authProvider: String(u.authProvider ?? u.AuthProvider ?? ""),
    subscription: normalizeSubscription(subscription),
    streakStatus:
      typeof streakStatus === "string"
        ? toCanonicalStreakStatus(streakStatus)
        : "",
    progress: p
      ? {
          id: Number(p.id ?? p.ID ?? 0),
          level: Number(p.level ?? p.Level ?? 0),
          xpTotal: Number(p.XpTotal ?? p.xpTotal ?? 0),
          xpForNextLevel: Number(p.XpForNextLevel ?? p.xpForNextLevel ?? 1),
          userID: Number(p.userID ?? p.UserID ?? 0),
        }
      : null,
    streak: st
      ? {
          id: Number(st.id ?? st.ID ?? 0),
          userID: Number(st.userID ?? st.UserID ?? u.id ?? u.ID ?? 0),
          currentStreak: Number(st.currentStreak ?? st.CurrentStreak ?? 0),
          longestStreak: Number(st.longestStreak ?? st.LongestStreak ?? 0),
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
  applyStreakSnapshot: (
    status?: string | null,
    currentStreak?: number | null,
  ) => void;

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
        });
        const user = normalizeUserFromBackend(meResponse.data);

        if (user) {
          setUserWithStreakEvent(user, true);
          return user;
        }
      } catch {
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
        });
        const user2 = normalizeUserFromBackend(meResponse2.data);

        setUserWithStreakEvent(user2, Boolean(user2));
        return user2;
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        set({ isAuth: false, user: null });
        return null;
      }
    } finally {
      set({ isLoading: false });
    }
  };

  const hydrateCurrentUser = async (): Promise<IUser | null> => {
    try {
      const meResponse = await $api.get("/auth/me", {
        skipAuthRefresh: true,
      });
      const user = normalizeUserFromBackend(meResponse.data);

      if (user) {
        setUserWithStreakEvent(user, true);
      }

      return user;
    } catch {
      return null;
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

    applyStreakSnapshot: (status, currentStreak) =>
      set((state) => {
        const user = state.user;
        if (!user || !status) return {};

        const kind = parseStreakStatus(status);
        const canonicalStatus = toCanonicalStreakStatus(status);

        if (!isActionableStreakKind(kind)) {
          return {
            user: { ...user, streakStatus: canonicalStatus || user.streakStatus },
          };
        }

        const baseStreak = normalizeStreak(user.id, user.streak);
        const hasServerStreak =
          typeof currentStreak === "number" && Number.isFinite(currentStreak);
        const nextCurrent = hasServerStreak
          ? Math.max(0, currentStreak)
          : applyStreakKind(baseStreak, kind).currentStreak;

        return {
          user: {
            ...user,
            streakStatus: canonicalStatus,
            streak: {
              ...baseStreak,
              currentStreak: nextCurrent,
              longestStreak: Math.max(baseStreak.longestStreak, nextCurrent),
            },
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

      const fallbackUser = normalizeUserFromBackend(response.data);
      setUserWithStreakEvent(fallbackUser, Boolean(fallbackUser));

      const hydratedUser = await hydrateCurrentUser();
      return hydratedUser ?? fallbackUser;
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

      const fallbackUser = normalizeUserFromBackend(response.data);
      setUserWithStreakEvent(fallbackUser, Boolean(fallbackUser));

      const hydratedUser = await hydrateCurrentUser();
      return hydratedUser ?? fallbackUser;
    },

    logout: async () => {
      localStorage.setItem("loggedOut", "true");

      try {
        await AuthService.logout();
      } catch (error) {
        console.log("logout error:", error);
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
        useUiStore.getState().showSnackbar(
          i18n.t("messages.profileUpdated", {
            ns: "profile",
            defaultValue: "Profile updated",
          }),
          "success",
        );
        return updated;
      } catch {
        useUiStore.getState().showSnackbar(
          i18n.t("messages.profileUpdateFailed", {
            ns: "profile",
            defaultValue: "Failed to update profile",
          }),
          "error",
        );
        return null;
      }
    },
  };
});
