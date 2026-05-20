import { create } from "zustand";
import { getApiErrorMessage } from "@/shared/lib/getApiErrorMessage";
import { useUiStore } from "@/shared/store/useUiStore";
import SpeechTestService from "../api/SpeechTestService";
import {
  getSpeechTestSearchBlob,
  mergeSpeechTest,
} from "../model/normalize";
import type {
  SpeechDifficulty,
  SpeechTest,
  SpeechTestCreateDto,
  SpeechTestUpdateDto,
} from "../model/types";

type SpeechTestAdminFilters = {
  search: string;
  difficulty: "" | SpeechDifficulty;
};

type SpeechTestAdminState = {
  items: SpeechTest[];
  total: number;
  selectedId: number | null;
  selected: SpeechTest | null;
  loading: boolean;
  selectedLoading: boolean;
  actionLoading: boolean;
  filters: SpeechTestAdminFilters;
  setFilter: <K extends keyof SpeechTestAdminFilters>(
    key: K,
    value: SpeechTestAdminFilters[K],
  ) => void;
  resetFilters: () => void;
  getFilteredItems: () => SpeechTest[];
  fetchAll: (force?: boolean) => Promise<void>;
  selectById: (id: number) => Promise<SpeechTest | null>;
  clearSelected: () => void;
  create: (payload: SpeechTestCreateDto) => Promise<boolean>;
  update: (id: number, payload: SpeechTestUpdateDto) => Promise<boolean>;
  delete: (id: number) => Promise<boolean>;
};

function getFallbackMessage(error: unknown, fallback: string): string {
  return getApiErrorMessage(error) ?? fallback;
}

export const useSpeechTestAdminStore = create<SpeechTestAdminState>(
  (set, get) => ({
    items: [],
    total: 0,
    selectedId: null,
    selected: null,
    loading: false,
    selectedLoading: false,
    actionLoading: false,
    filters: {
      search: "",
      difficulty: "",
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
          difficulty: "",
        },
      }),

    getFilteredItems: () => {
      const { items, filters } = get();
      const query = filters.search.trim().toLowerCase();

      return items.filter((item) => {
        if (filters.difficulty && item.difficulty !== filters.difficulty) {
          return false;
        }
        if (!query) return true;
        return getSpeechTestSearchBlob(item).includes(query);
      });
    },

    fetchAll: async (force = false) => {
      if (get().loading) return;
      if (!force && get().items.length > 0) return;

      set({ loading: true });
      try {
        const data = await SpeechTestService.getAll();
        set((state) => ({
          items: data.items.sort((left, right) => right.id - left.id),
          total: data.total,
          selected:
            state.selectedId === null
              ? state.selected
              : data.items.find((item) => item.id === state.selectedId) ??
                state.selected,
        }));
      } catch (error) {
        useUiStore
          .getState()
          .showSnackbar(
            getFallbackMessage(error, "Failed to load speech tests"),
            "error",
          );
      } finally {
        set({ loading: false });
      }
    },

    selectById: async (id) => {
      const cached = get().items.find((item) => item.id === id) ?? null;
      set({
        selectedId: id,
        selected: cached,
        selectedLoading: !cached,
      });

      try {
        const test = await SpeechTestService.getById(id);
        set((state) => ({
          selectedId: test.id,
          selected: test,
          selectedLoading: false,
          items: mergeSpeechTest(state.items, test),
        }));
        return test;
      } catch (error) {
        useUiStore
          .getState()
          .showSnackbar(
            getFallbackMessage(error, "Failed to load speech test"),
            "error",
          );
        set({ selectedLoading: false });
        return cached;
      }
    },

    clearSelected: () =>
      set({
        selectedId: null,
        selected: null,
        selectedLoading: false,
      }),

    create: async (payload) => {
      set({ actionLoading: true });
      try {
        const created = await SpeechTestService.create(payload);
        set((state) => ({
          items: mergeSpeechTest(state.items, created),
          total: Math.max(state.total + 1, state.items.length + 1),
          selectedId: created.id,
          selected: created,
        }));
        return true;
      } catch (error) {
        useUiStore
          .getState()
          .showSnackbar(
            getFallbackMessage(error, "Failed to create speech test"),
            "error",
          );
        return false;
      } finally {
        set({ actionLoading: false });
      }
    },

    update: async (id, payload) => {
      set({ actionLoading: true });
      try {
        const updated = await SpeechTestService.update(id, payload);
        set((state) => ({
          items: mergeSpeechTest(state.items, updated),
          selectedId: updated.id,
          selected: updated,
        }));
        return true;
      } catch (error) {
        useUiStore
          .getState()
          .showSnackbar(
            getFallbackMessage(error, "Failed to update speech test"),
            "error",
          );
        return false;
      } finally {
        set({ actionLoading: false });
      }
    },

    delete: async (id) => {
      set({ actionLoading: true });
      try {
        await SpeechTestService.delete(id);
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
          total: Math.max(0, state.total - 1),
          selectedId: state.selectedId === id ? null : state.selectedId,
          selected: state.selectedId === id ? null : state.selected,
          selectedLoading:
            state.selectedId === id ? false : state.selectedLoading,
        }));
        return true;
      } catch (error) {
        useUiStore
          .getState()
          .showSnackbar(
            getFallbackMessage(error, "Failed to delete speech test"),
            "error",
          );
        return false;
      } finally {
        set({ actionLoading: false });
      }
    },
  }),
);
