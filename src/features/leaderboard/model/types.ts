import type { Achievement } from "@/features/achievements/model/types";
import type { IUser } from "@/features/auth/model/IUser";

export type UserLeaderboardMetric = "xp" | "streak";
export type ProfileLeaderboardMetric = "word";
export type LeaderboardMetric = UserLeaderboardMetric | ProfileLeaderboardMetric;

export interface LeaderboardProfileEntry {
  lessonsCompleted: number;
  pinnedAchievements: Achievement[];
  user: IUser | null;
  userId: number;
  wordsLearned: number;
}
