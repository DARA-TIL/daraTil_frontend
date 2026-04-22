export type WsNotificationKind =
  | "achievement_unlocked"
  | "streak_increase"
  | "streak_reset"
  | "unknown";

export interface BaseWsNotification {
  userId?: number;
  type?: string;
}

export interface AchievementWsNotification extends BaseWsNotification {
  achievementId?: number;
  achievementID?: number;
}

export interface StreakWsNotification extends BaseWsNotification {
  streak?: number;
}

function normalizeType(raw: unknown): string {
  return String(raw ?? "")
    .trim()
    .replace(/[_\s-]+/g, "")
    .toLowerCase();
}

export function getWsNotificationKind(rawType: unknown): WsNotificationKind {
  const type = normalizeType(rawType);

  if (
    type === "achieved" ||
    type === "achievementunlocked" ||
    type === "achievementunlock"
  ) {
    return "achievement_unlocked";
  }

  if (type === "streakincrease" || type === "streakincreased") {
    return "streak_increase";
  }

  if (type === "streakreset" || type === "streakreseted") {
    return "streak_reset";
  }

  return "unknown";
}

export function parseWsNotification(raw: string): unknown | null {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
