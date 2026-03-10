import { create } from "zustand";
import ActivityService from "../api/ActivityService";
import type { ActivityItem } from "../model/types";
import { getApiErrorMessage } from "@/shared/lib/getApiErrorMessage";
import { useUiStore } from "@/shared/store/useUiStore";

const ACTIVITY_CACHE_MS = 30_000;

interface ActivityState {
  items: ActivityItem[];
  loading: boolean;
  lastLoadedAt: number | null;
  fetchRecent: (force?: boolean) => Promise<void>;
}

export const useActivityStore = create<ActivityState>((set, get) => ({
  items: [],
  loading: false,
  lastLoadedAt: null,

  fetchRecent: async (force = false) => {
    const { loading, lastLoadedAt } = get();
    if (loading) return;

    const hasFreshCache =
      !force &&
      lastLoadedAt !== null &&
      Date.now() - lastLoadedAt < ACTIVITY_CACHE_MS;

    if (hasFreshCache) return;

    set({ loading: true });

    try {
      const items = await ActivityService.getRecent();
      set({ items, lastLoadedAt: Date.now() });
    } catch (error) {
      const message =
        getApiErrorMessage(error) ?? "Failed to load recent activity";
      useUiStore.getState().showSnackbar(message, "error");
    } finally {
      set({ loading: false });
    }
  },
}));
