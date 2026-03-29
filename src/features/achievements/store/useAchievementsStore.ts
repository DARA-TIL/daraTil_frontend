import { create } from "zustand";
import type { Achievement } from "../model/types";
import AchievementService from "../api/AchievementService";
import { getApiErrorMessage } from "@/shared/lib/getApiErrorMessage";
import { useUiStore } from "@/shared/store/useUiStore";

type AchievementsState = {
  items: Achievement[];
  loading: boolean;
  fetchAll: (force?: boolean) => Promise<void>;
};

export const useAchievementsStore = create<AchievementsState>((set, get) => ({
  items: [],
  loading: false,

  fetchAll: async (force = false) => {
    if (get().loading) return;
    if (!force && get().items.length > 0) return;

    set({ loading: true });
    try {
      const items = await AchievementService.getAll();
      set({ items });
    } catch (error) {
      const message =
        getApiErrorMessage(error) ?? "Failed to load achievements";
      useUiStore.getState().showSnackbar(message, "error");
    } finally {
      set({ loading: false });
    }
  },
}));
