import { create } from "zustand";
import type {
  Achievement,
  AchievementCreateDto,
  AchievementUpdateDto,
} from "../model/types";
import AchievementService from "../api/AchievementService";
import AchievementAdminService from "../api/AchievementAdminService";
import { getApiErrorMessage } from "@/shared/lib/getApiErrorMessage";
import { useUiStore } from "@/shared/store/useUiStore";

type Filters = {
  search: string;
  action: string;
};

type AchievementsAdminState = {
  items: Achievement[];
  selectedId: number | null;
  selected: Achievement | null;
  loading: boolean;
  selectedLoading: boolean;
  actionLoading: boolean;
  filters: Filters;
  setFilter: (key: keyof Filters, value: string) => void;
  resetFilters: () => void;
  getFilteredItems: () => Achievement[];
  fetchAll: (force?: boolean) => Promise<void>;
  selectById: (id: number) => Promise<Achievement | null>;
  refreshSelected: () => Promise<Achievement | null>;
  clearSelected: () => void;
  create: (payload: AchievementCreateDto) => Promise<boolean>;
  update: (payload: AchievementUpdateDto) => Promise<boolean>;
  delete: (id: number) => Promise<boolean>;
};

function mergeAchievement(items: Achievement[], achievement: Achievement): Achievement[] {
  const found = items.some((item) => item.id === achievement.id);
  if (!found) return [achievement, ...items];
  return items.map((item) => (item.id === achievement.id ? achievement : item));
}

function toSearchBlob(item: Achievement): string {
  return [item.name, item.description, item.action].join(" ").toLowerCase();
}

export const useAchievementsAdminStore = create<AchievementsAdminState>(
  (set, get) => {
    async function withAction<T>(
      action: () => Promise<T>,
      fallbackMessage: string,
    ): Promise<T | null> {
      set({ actionLoading: true });
      try {
        return await action();
      } catch (error) {
        const message = getApiErrorMessage(error) ?? fallbackMessage;
        useUiStore.getState().showSnackbar(message, "error");
        return null;
      } finally {
        set({ actionLoading: false });
      }
    }

    async function fetchSelected(id: number): Promise<Achievement | null> {
      set({ selectedId: id, selectedLoading: true });
      try {
        const achievement = await AchievementService.getById(id);
        set((state) => ({
          selectedId: id,
          selected: achievement,
          items: mergeAchievement(state.items, achievement),
        }));
        return achievement;
      } catch (error) {
        const message =
          getApiErrorMessage(error) ?? "Failed to load selected achievement";
        useUiStore.getState().showSnackbar(message, "error");
        set({ selected: null });
        return null;
      } finally {
        set({ selectedLoading: false });
      }
    }

    return {
      items: [],
      selectedId: null,
      selected: null,
      loading: false,
      selectedLoading: false,
      actionLoading: false,
      filters: {
        search: "",
        action: "",
      },

      setFilter: (key, value) =>
        set((state) => ({
          filters: {
            ...state.filters,
            [key]: value,
          },
        })),

      resetFilters: () =>
        set({
          filters: {
            search: "",
            action: "",
          },
        }),

      getFilteredItems: () => {
        const { items, filters } = get();
        const query = filters.search.trim().toLowerCase();

        return items.filter((item) => {
          if (filters.action && item.action !== filters.action) return false;
          if (!query) return true;
          return toSearchBlob(item).includes(query);
        });
      },

      fetchAll: async (force = false) => {
        if (get().loading) return;
        if (!force && get().items.length > 0) return;

        set({ loading: true });
        try {
          const items = await AchievementService.getAll();
          set((state) => ({
            items,
            selected:
              state.selectedId === null
                ? state.selected
                : items.find((item) => item.id === state.selectedId) ?? state.selected,
          }));
        } catch (error) {
          const message =
            getApiErrorMessage(error) ?? "Failed to load achievements for admin";
          useUiStore.getState().showSnackbar(message, "error");
        } finally {
          set({ loading: false });
        }
      },

      selectById: async (id) => {
        if (!id) return null;
        return fetchSelected(id);
      },

      refreshSelected: async () => {
        const selectedId = get().selectedId;
        if (!selectedId) return null;
        return fetchSelected(selectedId);
      },

      clearSelected: () =>
        set({
          selectedId: null,
          selected: null,
          selectedLoading: false,
        }),

      create: async (payload) => {
        const result = await withAction(async () => {
          const created = await AchievementAdminService.create(payload);
          set((state) => ({
            items: mergeAchievement(state.items, created),
            selectedId: created.id,
            selected: created,
          }));
          return true;
        }, "Failed to create achievement");

        return Boolean(result);
      },

      update: async (payload) => {
        const result = await withAction(async () => {
          const updated = await AchievementAdminService.update(payload);
          set((state) => ({
            items: mergeAchievement(state.items, updated),
            selectedId: updated.id,
            selected: updated,
          }));
          return true;
        }, "Failed to update achievement");

        return Boolean(result);
      },

      delete: async (id) => {
        const result = await withAction(async () => {
          await AchievementAdminService.delete(id);
          set((state) => ({
            items: state.items.filter((item) => item.id !== id),
            selectedId: state.selectedId === id ? null : state.selectedId,
            selected: state.selectedId === id ? null : state.selected,
          }));
          return true;
        }, "Failed to delete achievement");

        return Boolean(result);
      },
    };
  },
);
