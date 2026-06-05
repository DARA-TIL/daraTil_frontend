import type { AchievementAction } from "./actions";

export interface UserAchievement {
  id: number;
  userId: number;
  achievementId: number;
  quantity: number;
  achieved: boolean;
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  action: AchievementAction;
  quantity: number;
  iconUrl: string | null;
  userAchievements: UserAchievement[];
}

export type AchievementCreateDto = Achievement;
export type AchievementUpdateDto = Achievement;
export type UserAchievementCreateDto = UserAchievement;
export type UserAchievementUpdateDto = UserAchievement;
