import { create } from "zustand";
import type { ActionRule } from "../model/types";
import ActionRulesService from "../api/ActionRulesService";
import { getApiErrorMessage } from "@/shared/lib/getApiErrorMessage";
import { useUiStore } from "@/shared/store/useUiStore";

type Filters = {
  search: string;
};

type ActionRulesAdminState = {
  items: ActionRule[];
  loading: boolean;
  actionLoading: boolean;
  filters: Filters;
  setFilter: (key: keyof Filters, value: string) => void;
  resetFilters: () => void;
  getFilteredItems: () => ActionRule[];
  fetchAll: (force?: boolean) => Promise<void>;
  create: (payload: ActionRule) => Promise<boolean>;
  update: (payload: ActionRule) => Promise<boolean>;
  delete: (action: string) => Promise<boolean>;
};

function mergeRule(items: ActionRule[], rule: ActionRule): ActionRule[] {
  const found = items.some((item) => item.action === rule.action);
  if (!found) return [rule, ...items];
  return items.map((item) => (item.action === rule.action ? rule : item));
}

export const useActionRulesAdminStore = create<ActionRulesAdminState>(
  (set, get) => ({
    items: [],
    loading: false,
    actionLoading: false,
    filters: {
      search: "",
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
        },
      }),

    getFilteredItems: () => {
      const query = get().filters.search.trim().toLowerCase();
      if (!query) return get().items;

      return get().items.filter((item) => {
        const searchBlob = `${item.action} ${Object.keys(item.rules).join(" ")}`.toLowerCase();
        return searchBlob.includes(query);
      });
    },

    fetchAll: async (force = false) => {
      if (get().loading) return;
      if (!force && get().items.length > 0) return;

      set({ loading: true });
      try {
        const items = await ActionRulesService.getAll();
        set({ items });
      } catch (error) {
        const message =
          getApiErrorMessage(error) ?? "Failed to load action rules";
        useUiStore.getState().showSnackbar(message, "error");
      } finally {
        set({ loading: false });
      }
    },

    create: async (payload) => {
      set({ actionLoading: true });
      try {
        const created = await ActionRulesService.create(payload);
        set((state) => ({
          items: mergeRule(state.items, created),
        }));
        return true;
      } catch (error) {
        const message =
          getApiErrorMessage(error) ?? "Failed to create action rule";
        useUiStore.getState().showSnackbar(message, "error");
        return false;
      } finally {
        set({ actionLoading: false });
      }
    },

    update: async (payload) => {
      set({ actionLoading: true });
      try {
        const updated = await ActionRulesService.update(payload);
        set((state) => ({
          items: mergeRule(state.items, updated),
        }));
        return true;
      } catch (error) {
        const message =
          getApiErrorMessage(error) ?? "Failed to update action rule";
        useUiStore.getState().showSnackbar(message, "error");
        return false;
      } finally {
        set({ actionLoading: false });
      }
    },

    delete: async (action) => {
      set({ actionLoading: true });
      try {
        await ActionRulesService.delete(action);
        set((state) => ({
          items: state.items.filter((item) => item.action !== action),
        }));
        return true;
      } catch (error) {
        const message =
          getApiErrorMessage(error) ?? "Failed to delete action rule";
        useUiStore.getState().showSnackbar(message, "error");
        return false;
      } finally {
        set({ actionLoading: false });
      }
    },
  }),
);
