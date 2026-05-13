import { create } from "zustand";
import { getApiErrorMessage } from "@/shared/lib/getApiErrorMessage";
import { useUiStore } from "@/shared/store/useUiStore";
import type { IUser } from "@/features/auth/model/IUser";
import LeaderboardService from "../api/LeaderboardService";
import type { LeaderboardMetric, LeaderboardProfileEntry } from "../model/types";

type LeaderboardState = {
  limit: number;
  loading: boolean;
  xpItems: IUser[];
  streakItems: IUser[];
  wordItems: LeaderboardProfileEntry[];
  fetchAll: (limit?: number, options?: { silent?: boolean }) => Promise<void>;
  getItems: (metric: LeaderboardMetric) => IUser[] | LeaderboardProfileEntry[];
};

export const useLeaderboardStore = create<LeaderboardState>((set, get) => ({
  limit: 10,
  loading: false,
  xpItems: [],
  streakItems: [],
  wordItems: [],

  fetchAll: async (limit = get().limit, options = {}) => {
    set({ loading: !options.silent, limit });

    try {
      const [xpItems, streakItems, wordItems] = await Promise.all([
        LeaderboardService.getUsers("xp", limit),
        LeaderboardService.getUsers("streak", limit),
        LeaderboardService.getProfiles("word", limit),
      ]);

      set({
        xpItems,
        streakItems,
        wordItems,
        limit,
      });
    } catch (error) {
      useUiStore.getState().showSnackbar(
        getApiErrorMessage(error) ?? "Failed to load leaderboard",
        "error",
      );
    } finally {
      set({ loading: false });
    }
  },

  getItems: (metric) => {
    const state = get();

    if (metric === "xp") return state.xpItems;
    if (metric === "streak") return state.streakItems;
    return state.wordItems;
  },
}));
