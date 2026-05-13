import {
  parseNotification,
} from "@/features/notifications/model/normalize";
import type {
  AppNotification,
} from "@/features/notifications/model/types";

export type WsNotificationKind =
  | "reward"
  | "streak_increase"
  | "streak_reset"
  | "logout"
  | "generic";

function normalizeMessageText(notification: AppNotification): string {
  const parts = [notification.title, notification.message].filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0];
  if (parts[0] === parts[1]) return parts[0];
  return `${parts[0]}: ${parts[1]}`;
}

function normalizeSignalText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[_\s-]+/g, "")
    .trim();
}

function isAchievementRewardText(value: string): boolean {
  return /achievement\s*unlocked/i.test(value);
}

function isResetMessage(value: string): boolean {
  const normalized = normalizeSignalText(value);

  return (
    normalized.includes("reset") ||
    normalized.includes("loststreak") ||
    normalized.includes("streaklost") ||
    normalized.includes("streakreset") ||
    normalized.includes("сброс") ||
    normalized.includes("сброш") ||
    normalized.includes("обнул") ||
    normalized.includes("потер") ||
    normalized.includes("үзіл") ||
    normalized.includes("жоғалт") ||
    normalized.includes("өш")
  );
}

export function parseWsNotification(raw: string): AppNotification | null {
  try {
    const parsed = JSON.parse(raw);
    return parseNotification(parsed);
  } catch {
    return null;
  }
}

export function getWsNotificationKind(
  notification: AppNotification,
): WsNotificationKind {
  if (notification.type === "reward") return "reward";
  if (notification.type === "logOut") return "logout";
  if (notification.type === "streak") {
    const signalText = [notification.title, notification.message]
      .filter(Boolean)
      .join(" ");

    if (notification.entityId === 0 || isResetMessage(signalText)) {
      return "streak_reset";
    }

    return "streak_increase";
  }

  return "generic";
}

export function getNotificationDisplayText(
  notification: AppNotification,
): string {
  return normalizeMessageText(notification);
}

export function isAchievementRewardNotification(
  notification: AppNotification,
): boolean {
  if (notification.type !== "reward") return false;

  const signalText = [notification.title, notification.message]
    .filter(Boolean)
    .join(" ");

  return isAchievementRewardText(signalText);
}
