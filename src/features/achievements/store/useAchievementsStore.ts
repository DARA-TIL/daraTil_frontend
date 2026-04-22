import { create } from "zustand";
import type { Achievement } from "../model/types";
import AchievementService from "../api/AchievementService";
import { getApiErrorMessage } from "@/shared/lib/getApiErrorMessage";
import { useUiStore } from "@/shared/store/useUiStore";
import type { UserAchievement } from "../model/types";

type AchievementsState = {
  items: Achievement[];
  loading: boolean;
  recentUnlockedId: number | null;
  fetchAll: (force?: boolean, options?: { silent?: boolean }) => Promise<void>;
  markUnlocked: (achievementId: number, userId: number) => void;
  removeById: (achievementId: number) => void;
  clearRecentUnlocked: () => void;
};

function mergeProgress(
  base: UserAchievement[],
  incoming: UserAchievement[],
): UserAchievement[] {
  const map = new Map<string, UserAchievement>();

  for (const progress of base) {
    map.set(`${progress.userId}:${progress.achievementId}`, progress);
  }

  for (const progress of incoming) {
    map.set(`${progress.userId}:${progress.achievementId}`, {
      ...map.get(`${progress.userId}:${progress.achievementId}`),
      ...progress,
    });
  }

  return Array.from(map.values());
}

function mergeAchievedIntoAll(
  allAchievements: Achievement[],
  achievedAchievements: Achievement[],
): Achievement[] {
  if (achievedAchievements.length === 0) return allAchievements;

  const map = new Map(
    allAchievements.map((achievement) => [achievement.id, achievement]),
  );

  for (const achieved of achievedAchievements) {
    const existing = map.get(achieved.id);
    if (!existing) {
      map.set(achieved.id, achieved);
      continue;
    }

    map.set(achieved.id, {
      ...existing,
      userAchievements: mergeProgress(
        existing.userAchievements ?? [],
        achieved.userAchievements ?? [],
      ),
    });
  }

  return Array.from(map.values());
}

export const useAchievementsStore = create<AchievementsState>((set, get) => ({
  items: [],
  loading: false,
  recentUnlockedId: null,

  fetchAll: async (force = false, options = {}) => {
    if (get().loading) return;
    if (!force && get().items.length > 0) return;

    if (!options.silent) {
      set({ loading: true });
    }

    try {
      const [items, achievedItems] = await Promise.all([
        AchievementService.getAll(),
        AchievementService.getAchieved().catch(() => []),
      ]);

      set({ items: mergeAchievedIntoAll(items, achievedItems) });
    } catch (error) {
      if (!options.silent) {
        const message =
          getApiErrorMessage(error) ?? "Failed to load achievements";
        useUiStore.getState().showSnackbar(message, "error");
      }
    } finally {
      if (!options.silent) {
        set({ loading: false });
      }
    }
  },

  markUnlocked: (achievementId, userId) =>
    set((state) => ({
      recentUnlockedId: achievementId,
      items: state.items.map((achievement) => {
        if (achievement.id !== achievementId) return achievement;

        const targetQuantity = Math.max(1, achievement.quantity);
        const existingProgress = achievement.userAchievements ?? [];
        const progressExists = existingProgress.some(
          (progress) => Number(progress.userId) === Number(userId),
        );

        const userAchievements = progressExists
          ? existingProgress.map((progress) =>
              Number(progress.userId) === Number(userId)
                ? {
                    ...progress,
                    achieved: true,
                    quantity: Math.max(progress.quantity ?? 0, targetQuantity),
                  }
                : progress,
            )
          : [
              ...existingProgress,
              {
                id: 0,
                userId,
                achievementId,
                quantity: targetQuantity,
                achieved: true,
              },
            ];

        return {
          ...achievement,
          userAchievements,
        };
      }),
    })),

  removeById: (achievementId) =>
    set((state) => ({
      recentUnlockedId:
        state.recentUnlockedId === achievementId ? null : state.recentUnlockedId,
      items: state.items.filter((achievement) => achievement.id !== achievementId),
    })),

  clearRecentUnlocked: () => set({ recentUnlockedId: null }),
}));
