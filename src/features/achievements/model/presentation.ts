import type { TFunction } from "i18next";
import type { Achievement, UserAchievement } from "./types";
import type { AchievementAction } from "./actions";

export interface AchievementProgressEntry {
  achievement: Achievement;
  progress: UserAchievement;
  percent: number;
  remaining: number;
  isCompleted: boolean;
  isStarted: boolean;
}

export function getActionLabel(action: AchievementAction, t: TFunction): string {
  const key = `actions.${action}`;
  const defaults: Record<string, string> = {
    lesson_completed: "Lesson completed",
    folklore_liked: "Folklore liked",
    folklore_disliked: "Folklore disliked",
    folklore_readed: "Folklore read",
    level_upgraded: "Level upgraded",
    region_slang_readed: "Region slang read",
    region_tradition_readed: "Region tradition read",
  };

  return t(key, {
    ns: "achievements",
    defaultValue: defaults[action] ?? action,
  });
}

export function getUserAchievementProgress(
  achievement: Achievement,
  userId: number,
): UserAchievement {
  const progress = achievement.userAchievements.find(
    (item) => item.userId === userId,
  );

  return (
    progress ?? {
      id: 0,
      userId,
      achievementId: achievement.id,
      quantity: 0,
      achieved: false,
    }
  );
}

export function getAchievementProgressPercent(
  achievement: Achievement,
  progress: UserAchievement,
): number {
  const total = Math.max(1, achievement.quantity);
  return Math.max(0, Math.min(100, Math.round((progress.quantity / total) * 100)));
}

export function getAchievementRemainingCount(
  achievement: Achievement,
  progress: UserAchievement,
): number {
  return Math.max(0, achievement.quantity - progress.quantity);
}

export function getAchievementCompletionStats(
  achievements: Achievement[],
  userId: number,
) {
  const entries: AchievementProgressEntry[] = achievements.map((achievement) => {
    const progress = getUserAchievementProgress(achievement, userId);
    const percent = getAchievementProgressPercent(achievement, progress);
    const remaining = getAchievementRemainingCount(achievement, progress);

    return {
      achievement,
      progress,
      percent,
      remaining,
      isCompleted: progress.achieved || remaining === 0,
      isStarted: progress.quantity > 0,
    };
  });

  return {
    entries,
    total: entries.length,
    completed: entries.filter((item) => item.isCompleted).length,
    inProgress: entries.filter((item) => item.isStarted && !item.isCompleted).length,
    hidden: entries.filter((item) => !item.isStarted && !item.isCompleted).length,
  };
}
