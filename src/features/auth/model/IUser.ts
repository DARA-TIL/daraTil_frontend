import type { Subscription } from "@/features/subscriptions/model/types";

export interface IUserProgress {
  id: number;
  level: number;
  xpTotal: number;
  xpForNextLevel: number;
  userID: number;
}

export interface IUserStreak {
  id: number;
  userID: number;
  currentStreak: number;
  longestStreak: number;
}

export interface IUser {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  role: string;
  authProvider: string;
  progress: IUserProgress | null;
  subscription?: Subscription | null;

  // NEW
  streak?: IUserStreak | null;

  // NEW: строка сверху "streak": "NoChange"
  streakStatus?: string;
}
