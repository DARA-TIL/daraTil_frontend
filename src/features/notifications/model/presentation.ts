import type { TFunction } from "i18next";
import type {
  AppNotification,
  NotificationScope,
  NotificationType,
} from "./types";

export function getNotificationTypeLabel(
  type: NotificationType,
  t: TFunction<"notifications">,
): string {
  return t(`types.${type}`, {
    defaultValue:
      type === "logOut"
        ? "Log out"
        : type.charAt(0).toUpperCase() + type.slice(1),
  });
}

export function getNotificationScopeLabel(
  scope: NotificationScope,
  t: TFunction<"notifications">,
): string {
  return t(`scopes.${scope}`, {
    defaultValue: scope === "global" ? "Global" : "User",
  });
}

export function formatNotificationDate(value: string, language: string): string {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat(language || "en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function getNotificationChipColor(
  type: NotificationType,
): "default" | "primary" | "success" | "warning" | "error" | "info" | "secondary" {
  if (type === "reward") return "success";
  if (type === "streak") return "warning";
  if (type === "event") return "primary";
  if (type === "logOut") return "error";
  return "info";
}

export function getNotificationActionTo(
  notification: AppNotification,
): string | null {
  if (notification.type === "reward") return "/app/progress";
  if (notification.type === "event") return "/app/events";
  if (notification.type === "streak") return "/app/profile";
  return null;
}

export function getNotificationHeading(
  notification: AppNotification,
  t: TFunction<"notifications">,
): string {
  if (notification.title) return notification.title;
  return getNotificationTypeLabel(notification.type, t);
}
