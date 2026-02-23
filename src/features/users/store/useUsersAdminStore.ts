import { create } from "zustand";
import axios from "axios";
import UsersAdminService from "../api/UsersAdminService";
import type { User, UserUpdateDto } from "../model/types";
import { useUiStore } from "@/shared/store/useUiStore";

function getErrorMessage(e: unknown): string {
  if (axios.isAxiosError(e)) {
    const backendError = (e.response?.data as any)?.error;
    if (backendError) return String(backendError);
  }
  return "Something went wrong. Please try again.";
}

type AdminFilters = {
  search: string;
  role: string;
};

interface UsersAdminState {
  items: User[];
  loading: boolean;

  selected: User | null;

  filters: AdminFilters;
  setFilter: (k: keyof AdminFilters, v: string) => void;
  resetFilters: () => void;

  fetchAll: () => Promise<void>;
  fetchById: (id: number) => Promise<void>;
  updateById: (id: number, payload: UserUpdateDto) => Promise<boolean>;
  levelUpMe: (xp: number) => Promise<boolean>;

  getFilteredItems: () => User[];
}

export const useUsersAdminStore = create<UsersAdminState>((set, get) => ({
  items: [],
  loading: false,
  selected: null,

  filters: { search: "", role: "" },

  setFilter: (k, v) => set((s) => ({ filters: { ...s.filters, [k]: v } })),
  resetFilters: () => set({ filters: { search: "", role: "" } }),

  fetchAll: async () => {
    set({ loading: true });
    try {
      const data = await UsersAdminService.getAll();
      set({ items: data });
    } catch (e) {
      useUiStore.getState().showSnackbar(getErrorMessage(e), "error");
    } finally {
      set({ loading: false });
    }
  },

  fetchById: async (id) => {
    set({ loading: true });
    try {
      const u = await UsersAdminService.getById(id);
      set({ selected: u });
    } catch (e) {
      useUiStore.getState().showSnackbar(getErrorMessage(e), "error");
      set({ selected: null });
    } finally {
      set({ loading: false });
    }
  },

  updateById: async (id, payload) => {
    set({ loading: true });
    try {
      const updated = await UsersAdminService.updateById(id, payload);
      set((s) => ({
        items: s.items.map((x) => (x.id === id ? updated : x)),
        selected: s.selected?.id === id ? updated : s.selected,
      }));
      useUiStore.getState().showSnackbar("User updated", "success");
      return true;
    } catch (e) {
      useUiStore.getState().showSnackbar(getErrorMessage(e), "error");
      return false;
    } finally {
      set({ loading: false });
    }
  },

  getFilteredItems: () => {
    const { items, filters } = get();
    const q = filters.search.trim().toLowerCase();

    return items.filter((u) => {
      if (
        filters.role &&
        String(u.role).toLowerCase() !== filters.role.toLowerCase()
      )
        return false;

      if (!q) return true;

      const hay = `${u.username} ${u.email} ${u.role}`.toLowerCase();
      return hay.includes(q);
    });
  },

  levelUpMe: async (xp) => {
    set({ loading: true });
    try {
      await UsersAdminService.levelUp(xp);
      useUiStore.getState().showSnackbar("Level updated", "success");
      return true;
    } catch (e) {
      useUiStore.getState().showSnackbar(getErrorMessage(e), "error");
      return false;
    } finally {
      set({ loading: false });
    }
  },
}));
