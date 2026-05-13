import type { Achievement } from "@/features/achievements/model/types";
import { normalizeAchievement } from "@/features/achievements/model/normalize";
import { isRecord, unwrapApiData } from "@/shared/lib/unknownRecord";

export interface ProfileUser {
  id: number;
  username: string;
  email: string;
  avatar: string;
  role: string;
}

export interface UserProfile {
  userId: number;
  pinnedAchievements: Achievement[];
  lessonsCompleted: number;
  wordsLearned: number;
  user: ProfileUser | null;
}

export interface CreateUserProfileDto {
  userId: number;
}

export interface UserProfileUpdateDto {
  pinnedAchievementIds: number[];
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

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function normalizeProfileUser(dto: unknown): ProfileUser | null {
  if (!isRecord(dto)) return null;

  return {
    id: asNumber(dto.id ?? dto.ID),
    username: asString(dto.username ?? dto.Username ?? dto.name ?? dto.Name),
    email: asString(dto.email ?? dto.Email),
    avatar: asString(dto.avatar ?? dto.Avatar),
    role: asString(dto.role ?? dto.Role),
  };
}

export function normalizeUserProfile(payload: unknown): UserProfile | null {
  const value = unwrapApiData(payload);
  if (!isRecord(value)) return null;

  return {
    userId: asNumber(value.userId ?? value.UserID ?? value.userID),
    pinnedAchievements: asArray(
      value.pinnedAchievements ?? value.PinnedAchievements,
    ).map(normalizeAchievement),
    lessonsCompleted: asNumber(
      value.lessonsCompleted ?? value.LessonsCompleted,
    ),
    wordsLearned: asNumber(value.wordsLearned ?? value.WordsLearned),
    user: normalizeProfileUser(value.user ?? value.User),
  };
}
