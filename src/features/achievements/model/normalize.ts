import type { Achievement, UserAchievement } from "./types";
import type { AchievementAction } from "./actions";

type RawRecord = Record<string, unknown>;

function isRecord(value: unknown): value is RawRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function asString(value: unknown): string {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return "";
  return String(value);
}

function asNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function asBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1";
  }
  return false;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function unwrap(payload: unknown): unknown {
  if (!isRecord(payload)) return payload;
  return payload.data ?? payload;
}

export function normalizeUserAchievement(dto: unknown): UserAchievement {
  const record = isRecord(dto) ? dto : {};

  return {
    id: asNumber(record.id ?? record.ID),
    userId: asNumber(record.userId ?? record.UserID ?? record.userID),
    achievementId: asNumber(
      record.achievementId ?? record.AchievementID ?? record.achievementID,
    ),
    quantity: asNumber(record.quantity ?? record.Quantity),
    achieved: asBoolean(record.achieved ?? record.Achieved),
  };
}

export function normalizeAchievement(dto: unknown): Achievement {
  const record = isRecord(dto) ? dto : {};

  return {
    id: asNumber(record.id ?? record.ID),
    name: asString(record.name ?? record.Name),
    description: asString(record.description ?? record.Description),
    action: asString(record.action ?? record.Action) as AchievementAction,
    quantity: asNumber(record.quantity ?? record.Quantity),
    iconUrl: asString(record.iconUrl ?? record.IconURL ?? record.iconURL) || null,
    userAchievements: asArray(
      record.userAchievements ?? record.UserAchievements,
    ).map(normalizeUserAchievement),
  };
}

export function unwrapAchievementListPayload(payload: unknown): Achievement[] {
  return asArray(unwrap(payload)).map(normalizeAchievement);
}

export function unwrapAchievementPayload(payload: unknown): Achievement | null {
  const value = unwrap(payload);
  if (isRecord(value) && (value.id !== undefined || value.ID !== undefined)) {
    return normalizeAchievement(value);
  }
  if (isRecord(value) && isRecord(value.achievement)) {
    return normalizeAchievement(value.achievement);
  }
  return null;
}
