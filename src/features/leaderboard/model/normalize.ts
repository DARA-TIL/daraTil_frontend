import type { Achievement } from "@/features/achievements/model/types";
import { normalizeAchievement } from "@/features/achievements/model/normalize";
import type { IUser } from "@/features/auth/model/IUser";
import { isRecord, unwrapApiData } from "@/shared/lib/unknownRecord";
import type {
  LeaderboardProfileEntry,
  ProfileLeaderboardMetric,
  UserLeaderboardMetric,
} from "./types";

type RawRecord = Record<string, unknown>;

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

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function normalizeUser(dto: unknown): IUser | null {
  if (!isRecord(dto)) return null;

  const p = (dto.progress ?? dto.Progress) as RawRecord | undefined;
  const st = (dto.streak ?? dto.Streak) as RawRecord | undefined;

  return {
    id: asNumber(dto.id ?? dto.ID),
    username: asString(dto.username ?? dto.Username),
    email: asString(dto.email ?? dto.Email),
    avatar: asString(dto.avatar ?? dto.Avatar),
    role: asString(dto.role ?? dto.Role),
    authProvider: asString(dto.authProvider ?? dto.AuthProvider),
    streakStatus: "",
    progress: p
      ? {
          id: asNumber(p.id ?? p.ID),
          level: asNumber(p.level ?? p.Level),
          xpTotal: asNumber(p.XpTotal ?? p.xpTotal),
          xpForNextLevel: Math.max(
            1,
            asNumber(p.XpForNextLevel ?? p.xpForNextLevel),
          ),
          userID: asNumber(p.userID ?? p.UserID),
        }
      : null,
    streak: st
      ? {
          id: asNumber(st.id ?? st.ID),
          userID: asNumber(st.userID ?? st.UserID),
          currentStreak: asNumber(st.currentStreak ?? st.CurrentStreak),
          longestStreak: asNumber(st.longestStreak ?? st.LongestStreak),
        }
      : null,
  };
}

function unwrapList(payload: unknown): unknown[] {
  const value = unwrapApiData(payload);
  return Array.isArray(value) ? value : [];
}

export function normalizeUserLeaderboard(payload: unknown): IUser[] {
  return unwrapList(payload)
    .map(normalizeUser)
    .filter((item): item is IUser => Boolean(item));
}

function normalizePinnedAchievements(value: unknown): Achievement[] {
  return asArray(value).map(normalizeAchievement);
}

export function normalizeProfileLeaderboard(
  payload: unknown,
): LeaderboardProfileEntry[] {
  return unwrapList(payload)
    .map((item) => {
      if (!isRecord(item)) return null;

      return {
        lessonsCompleted: asNumber(
          item.lessonsCompleted ?? item.LessonsCompleted,
        ),
        pinnedAchievements: normalizePinnedAchievements(
          item.pinnedAchievements ?? item.PinnedAchievements,
        ),
        user: normalizeUser(item.user ?? item.User),
        userId: asNumber(item.userId ?? item.UserID ?? item.userID),
        wordsLearned: asNumber(item.wordsLearned ?? item.WordsLearned),
      } satisfies LeaderboardProfileEntry;
    })
    .filter((item): item is LeaderboardProfileEntry => Boolean(item));
}

export function isUserMetric(
  metric: UserLeaderboardMetric | ProfileLeaderboardMetric,
): metric is UserLeaderboardMetric {
  return metric === "xp" || metric === "streak";
}
