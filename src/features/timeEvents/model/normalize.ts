import type { IUser } from "@/features/auth/model/IUser";
import {
  isRecord,
  unwrapApiData,
  type UnknownRecord,
} from "@/shared/lib/unknownRecord";
import type {
  TimeEvent,
  TimeEventParticipant,
} from "./types";

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

function normalizeUser(dto: unknown): IUser | null {
  if (!isRecord(dto)) return null;

  const progress = (dto.progress ?? dto.Progress) as UnknownRecord | undefined;
  const streak = (dto.streak ?? dto.Streak) as UnknownRecord | undefined;

  return {
    id: asNumber(dto.id ?? dto.ID),
    username: asString(dto.username ?? dto.Username),
    email: asString(dto.email ?? dto.Email),
    avatar: asString(dto.avatar ?? dto.Avatar),
    role: asString(dto.role ?? dto.Role),
    authProvider: asString(dto.authProvider ?? dto.AuthProvider),
    progress: progress
      ? {
          id: asNumber(progress.id ?? progress.ID),
          level: asNumber(progress.level ?? progress.Level),
          xpTotal: asNumber(progress.XpTotal ?? progress.xpTotal),
          xpForNextLevel: Math.max(
            1,
            asNumber(progress.XpForNextLevel ?? progress.xpForNextLevel),
          ),
          userID: asNumber(progress.userID ?? progress.UserID),
        }
      : null,
    streak: streak
      ? {
          id: asNumber(streak.id ?? streak.ID),
          userID: asNumber(streak.userID ?? streak.UserID),
          currentStreak: asNumber(streak.currentStreak ?? streak.CurrentStreak),
          longestStreak: asNumber(streak.longestStreak ?? streak.LongestStreak),
        }
      : null,
    streakStatus: "",
  };
}

export function normalizeTimeEventParticipant(
  dto: unknown,
): TimeEventParticipant | null {
  if (!isRecord(dto)) return null;

  return {
    count: asNumber(dto.count ?? dto.Count),
    id: asNumber(dto.id ?? dto.ID),
    isActive: asBoolean(dto.isActive ?? dto.IsActive),
    place: asNumber(dto.place ?? dto.Place),
    timeEventId: asNumber(dto.timeEventId ?? dto.TimeEventID ?? dto.timeEventID),
    user: normalizeUser(dto.user ?? dto.User),
    userId: asNumber(dto.userId ?? dto.UserID ?? dto.userID),
  };
}

export function normalizeTimeEvent(dto: unknown): TimeEvent | null {
  if (!isRecord(dto)) return null;

  return {
    description: asString(dto.description ?? dto.Description),
    duration: asNumber(dto.duration ?? dto.Duration),
    endDate: asString(dto.endDate ?? dto.EndDate),
    eventType: asString(dto.eventType ?? dto.EventType),
    id: asNumber(dto.id ?? dto.ID),
    name: asString(dto.name ?? dto.Name),
    participants: asArray(dto.participants ?? dto.Participants)
      .map(normalizeTimeEventParticipant)
      .filter((item): item is TimeEventParticipant => Boolean(item)),
    rewardFirst: asNumber(dto.rewardFirst ?? dto.RewardFirst),
    rewardSecond: asNumber(dto.rewardSecond ?? dto.RewardSecond),
    rewardThird: asNumber(dto.rewardThird ?? dto.RewardThird),
    startDate: asString(dto.startDate ?? dto.StartDate),
    status: asString(dto.status ?? dto.Status),
  };
}

export function unwrapTimeEventListPayload(payload: unknown): TimeEvent[] {
  const value = unwrapApiData(payload);
  return asArray(value)
    .map(normalizeTimeEvent)
    .filter((item): item is TimeEvent => Boolean(item));
}

export function unwrapTimeEventPayload(payload: unknown): TimeEvent | null {
  const value = unwrapApiData(payload);
  if (isRecord(value) && (value.id !== undefined || value.ID !== undefined)) {
    return normalizeTimeEvent(value);
  }
  if (isRecord(value) && isRecord(value.timeEvent)) {
    return normalizeTimeEvent(value.timeEvent);
  }
  return null;
}

export function unwrapTimeEventParticipantListPayload(
  payload: unknown,
): TimeEventParticipant[] {
  const value = unwrapApiData(payload);
  return asArray(value)
    .map(normalizeTimeEventParticipant)
    .filter((item): item is TimeEventParticipant => Boolean(item));
}

export function unwrapTimeEventParticipantPayload(
  payload: unknown,
): TimeEventParticipant | null {
  const value = unwrapApiData(payload);
  if (isRecord(value) && (value.id !== undefined || value.ID !== undefined)) {
    return normalizeTimeEventParticipant(value);
  }
  if (isRecord(value) && isRecord(value.participant)) {
    return normalizeTimeEventParticipant(value.participant);
  }
  if (isRecord(value) && isRecord(value.timeEventParticipant)) {
    return normalizeTimeEventParticipant(value.timeEventParticipant);
  }
  return null;
}
