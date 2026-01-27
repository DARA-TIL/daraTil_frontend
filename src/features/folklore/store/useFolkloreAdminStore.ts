import { create } from "zustand";
import axios from "axios";
import { useUiStore } from "@/shared/store/useUiStore";
import FolkloreAdminService from "../api/FolkloreAdminService";
import type {
  Folklore,
  FolkloreCreateDto,
  FolkloreUpdateDto,
} from "../model/types";

function getErrorMessage(e: unknown): string {
  if (axios.isAxiosError(e)) {
    const backendError = (e.response?.data as any)?.error;
    if (backendError) return String(backendError);
  }
  return "Something went wrong. Please try again.";
}

type AdminFilters = {
  search: string; // по названию/контенту/автору (локально) - можно потом прикрутить /search
  type: string;
  region: string;
};

interface FolkloreAdminState {
  items: Folklore[];
  loading: boolean;

  filters: AdminFilters;

  setFilter: (key: keyof AdminFilters, value: string) => void;
  resetFilters: () => void;

  fetchAll: () => Promise<void>;
  create: (payload: FolkloreCreateDto) => Promise<Folklore | null>;
  update: (id: number, payload: FolkloreUpdateDto) => Promise<Folklore | null>;
  remove: (id: number) => Promise<boolean>;

  getFilteredItems: () => Folklore[];
}

export const useFolkloreAdminStore = create<FolkloreAdminState>((set, get) => ({
  items: [],
  loading: false,

  filters: { search: "", type: "", region: "" },

  setFilter: (key, value) =>
    set((s) => ({ filters: { ...s.filters, [key]: value } })),

  resetFilters: () => set({ filters: { search: "", type: "", region: "" } }),

  fetchAll: async () => {
    set({ loading: true });
    try {
      const data = await FolkloreAdminService.getAll();
      set({ items: data });
    } catch (e) {
      useUiStore.getState().showSnackbar(getErrorMessage(e), "error");
    } finally {
      set({ loading: false });
    }
  },

  create: async (payload) => {
    set({ loading: true });
    try {
      const created = await FolkloreAdminService.create(payload);
      set((s) => ({ items: [created, ...s.items] }));
      useUiStore.getState().showSnackbar("Folklore created", "success");
      return created;
    } catch (e) {
      useUiStore.getState().showSnackbar(getErrorMessage(e), "error");
      return null;
    } finally {
      set({ loading: false });
    }
  },

  update: async (id, payload) => {
    set({ loading: true });
    try {
      const updated = await FolkloreAdminService.update(id, payload);
      set((s) => ({
        items: s.items.map((x) => (x.id === id ? { ...x, ...updated } : x)),
      }));
      useUiStore.getState().showSnackbar("Folklore updated", "success");
      return updated;
    } catch (e) {
      useUiStore.getState().showSnackbar(getErrorMessage(e), "error");
      return null;
    } finally {
      set({ loading: false });
    }
  },

  remove: async (id) => {
    set({ loading: true });
    try {
      await FolkloreAdminService.remove(id);
      set((s) => ({ items: s.items.filter((x) => x.id !== id) }));
      useUiStore.getState().showSnackbar("Folklore deleted", "success");
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

    return items.filter((x) => {
      if (filters.type && x.type !== filters.type) return false;
      if (filters.region && x.region !== filters.region) return false;

      if (!q) return true;

      const hay = `${x.name} ${x.content} ${x.author}`.toLowerCase();
      return hay.includes(q);
    });
  },
}));
