import i18n from "@/shared/config/i18n/i18n";
import { API_URL } from "@/shared/api/http";
import { useUiStore } from "@/shared/store/useUiStore";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useAchievementsStore } from "@/features/achievements/store/useAchievementsStore";
import { useNotificationsStore } from "@/features/notifications/store/useNotificationsStore";
import {
  getNotificationDisplayText,
  isAchievementRewardNotification,
  getWsNotificationKind,
  parseWsNotification,
} from "./notifications";
import type { AppNotification } from "@/features/notifications/model/types";

const RECONNECT_DELAYS = [1000, 2000, 5000, 10000, 30000] as const;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof WebSocket !== "undefined";
}

function getConfiguredWsUrl(): string | null {
  return import.meta.env.VITE_WS_URL ?? null;
}

function getWsAuthMode(): "cookie" | "query" | "none" {
  const value = String(import.meta.env.VITE_WS_AUTH_MODE ?? "none").toLowerCase();

  if (value === "cookie" || value === "query") return value;
  return "none";
}

function isWsDisabledByEnv(): boolean {
  const value = String(import.meta.env.VITE_WS_ENABLED ?? "true").toLowerCase();

  return value === "false" || value === "0";
}

function buildWsUrl(): string {
  const explicitUrl = getConfiguredWsUrl();
  const url = new URL(explicitUrl || API_URL, window.location.origin);

  if (!explicitUrl) {
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    url.pathname = `${url.pathname.replace(/\/$/, "")}/ws`;
  }

  const token = localStorage.getItem("token");
  if (token && getWsAuthMode() === "query" && !url.searchParams.has("token")) {
    // Opt-in only: query tokens leak into browser/network logs.
    // Use VITE_WS_AUTH_MODE=query only if the backend explicitly supports it.
    url.searchParams.set("token", token);
  }

  return url.toString();
}

function isCurrentUserMessage(message: AppNotification): boolean {
  const currentUserId = useAuthStore.getState().user?.id;
  if (message.scope === "global") return true;
  if (!message.userId || !currentUserId) return true;
  return Number(message.userId) === Number(currentUserId);
}

function shouldShowRealtimeToast(): boolean {
  return typeof document === "undefined" || document.visibilityState === "visible";
}

class AppWebSocket {
  private ws: WebSocket | null = null;
  private shouldReconnect = false;
  private reconnectTimer: number | null = null;
  private reconnectAttempt = 0;
  private warnedHandshakeFailure = false;
  private warnedDisabled = false;
  private warnedMissingAuthMode = false;

  connect() {
    if (!isBrowser()) return;
    if (isWsDisabledByEnv()) {
      this.warnOnceDisabled();
      return;
    }
    if (getWsAuthMode() === "none") {
      this.warnOnceMissingAuthMode();
      return;
    }
    if (!useAuthStore.getState().isAuth) return;
    if (localStorage.getItem("loggedOut") === "true") return;
    if (
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN ||
        this.ws.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    this.shouldReconnect = true;
    this.clearReconnectTimer();
    let opened = false;

    try {
      this.ws = new WebSocket(buildWsUrl());
    } catch (error) {
      console.warn("WS connection creation failed", error);
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      opened = true;
      this.reconnectAttempt = 0;
      this.warnedHandshakeFailure = false;
    };

    this.ws.onmessage = (event) => {
      if (typeof event.data !== "string") return;
      this.handleMessage(event.data);
    };

    this.ws.onerror = (error) => {
      if (import.meta.env.DEV) {
        console.warn("WS error", error);
      }
    };

    this.ws.onclose = (event) => {
      this.ws = null;

      if (!opened) {
        this.handleHandshakeFailure(event);
        return;
      }

      this.scheduleReconnect();
    };
  }

  disconnect() {
    this.shouldReconnect = false;
    this.clearReconnectTimer();

    const socket = this.ws;
    this.ws = null;

    if (
      socket &&
      (socket.readyState === WebSocket.OPEN ||
        socket.readyState === WebSocket.CONNECTING)
    ) {
      socket.close(1000, "client disconnect");
    }
  }

  private clearReconnectTimer() {
    if (this.reconnectTimer === null) return;
    window.clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
  }

  private scheduleReconnect() {
    if (!this.shouldReconnect) return;
    if (isWsDisabledByEnv()) return;
    if (!useAuthStore.getState().isAuth) return;
    if (localStorage.getItem("loggedOut") === "true") return;

    const delay =
      RECONNECT_DELAYS[
        Math.min(this.reconnectAttempt, RECONNECT_DELAYS.length - 1)
      ];

    this.reconnectAttempt += 1;
    this.clearReconnectTimer();
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  private warnOnceDisabled() {
    if (this.warnedDisabled || !import.meta.env.DEV) return;
    this.warnedDisabled = true;
    console.warn("WS disabled by VITE_WS_ENABLED=false");
  }

  private warnOnceMissingAuthMode() {
    if (this.warnedMissingAuthMode || !import.meta.env.DEV) return;
    this.warnedMissingAuthMode = true;
    console.warn(
      [
        "WS not started because VITE_WS_AUTH_MODE is not configured.",
        "Browser WebSocket cannot send Authorization headers.",
        "Set VITE_WS_AUTH_MODE=cookie if backend authenticates /api/ws via cookies,",
        "or VITE_WS_AUTH_MODE=query if backend explicitly accepts ?token=.",
      ].join(" "),
    );
  }

  private handleHandshakeFailure(event: CloseEvent) {
    this.shouldReconnect = false;
    this.clearReconnectTimer();

    if (this.warnedHandshakeFailure || !import.meta.env.DEV) return;
    this.warnedHandshakeFailure = true;

    console.warn(
      [
        "WS closed before connection opened.",
        "Browser WebSocket cannot send Authorization headers.",
        "Backend /api/ws must support cookie auth or opt-in query-token auth.",
        "If query auth is supported, set VITE_WS_AUTH_MODE=query.",
      ].join(" "),
      {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
      },
    );
  }

  private handleMessage(raw: string) {
    const notification = parseWsNotification(raw);
    if (!notification) {
      console.warn("Invalid WS message", raw);
      return;
    }

    if (!notification.isActive) return;
    if (!isCurrentUserMessage(notification)) return;

    const kind = getWsNotificationKind(notification);

    if (kind !== "logout") {
      useNotificationsStore.getState().receiveRealtime(notification);
    }

    if (kind === "reward") {
      this.handleRewardNotification(notification);
      return;
    }

    if (kind === "streak_increase" || kind === "streak_reset") {
      this.handleStreakMessage(notification, kind);
      return;
    }

    if (kind === "logout") {
      this.handleLogoutNotification(notification);
      return;
    }

    this.handleGenericNotification(notification);
  }

  private handleRewardNotification(notification: AppNotification) {
    const achievementReward = isAchievementRewardNotification(notification);

    if (achievementReward) {
      void useAchievementsStore.getState().fetchAll(true, { silent: true });
    }

    if (!shouldShowRealtimeToast()) return;

    const toastMessage =
      getNotificationDisplayText(notification) ||
      i18n.t(
        achievementReward
          ? "notifications.achievementUnlocked"
          : "notifications.rewardReceived",
        {
          ns: "achievements",
          defaultValue: achievementReward
            ? "Achievement unlocked"
            : "Reward received",
        },
      );

    useUiStore.getState().showSnackbar(
      toastMessage,
      "success",
      achievementReward
        ? {
            actionLabel: i18n.t("notifications.view", {
              ns: "achievements",
              defaultValue: "View",
            }),
            actionTo: "/app/progress",
          }
        : undefined,
    );
  }

  private handleStreakMessage(
    notification: AppNotification,
    kind: "streak_increase" | "streak_reset",
  ) {
    const hasSnapshot =
      typeof notification.entityId === "number" &&
      Number.isFinite(notification.entityId);
    const streak = hasSnapshot ? Number(notification.entityId) : 0;
    const status = kind === "streak_reset" ? "Reset" : "Incremented";

    useAuthStore
      .getState()
      .applyStreakSnapshot(status, hasSnapshot ? streak : null);

    if (!shouldShowRealtimeToast()) return;

    const toastMessage =
      getNotificationDisplayText(notification) ||
      i18n.t(
        kind === "streak_reset"
          ? "notifications.streakReset"
          : "notifications.streakIncrease",
        {
          ns: "achievements",
          defaultValue:
            kind === "streak_reset"
              ? "Your streak was reset. Start a new streak today."
              : "You're on a {{count}}-day streak.",
          count: Math.max(0, streak),
        },
      );

    useUiStore.getState().showSnackbar(
      toastMessage,
      kind === "streak_reset" ? "info" : "success",
    );
  }

  private handleLogoutNotification(notification: AppNotification) {
    const text =
      getNotificationDisplayText(notification) || "Your session was closed.";

    this.disconnect();
    localStorage.setItem("loggedOut", "true");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    useAuthStore.setState({ isAuth: false, user: null, isLoading: false });
    useNotificationsStore.getState().reset();
    useUiStore.getState().showSnackbar(text, "warning");

    const pathname = window.location.pathname;
    if (pathname !== "/login" && pathname !== "/register" && pathname !== "/forgot-password") {
      window.location.replace("/login");
    }
  }

  private handleGenericNotification(notification: AppNotification) {
    if (!shouldShowRealtimeToast()) return;

    const text = getNotificationDisplayText(notification);
    if (!text) return;

    useUiStore.getState().showSnackbar(text, "info");
  }
}

export const appWebSocket = new AppWebSocket();
