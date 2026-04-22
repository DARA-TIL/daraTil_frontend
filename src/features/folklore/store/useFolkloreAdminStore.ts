import { create } from "zustand";
import { useUiStore } from "@/shared/store/useUiStore";
import FolkloreAdminService from "../api/FolkloreAdminService";
import type {
  Folklore,
  FolkloreCreateDto,
  FolkloreUpdateDto,
} from "../model/types";
import { getApiErrorMessage } from "@/shared/lib/getApiErrorMessage";

function getErrorMessage(error: unknown): string {
  return getApiErrorMessage(error) ?? "Something went wrong. Please try again.";
}

type AdminFilters = {
  search: string;
  type: string;
  region: string;
};

type FetchAllOpts = {
  force?: boolean; // всегда грузить с сервера
  silent?: boolean; // не трогать loading (например авто-рефреш)
};

interface FolkloreAdminState {
  items: Folklore[];
  loading: boolean;

  // кэш
  lastLoadedAt: number | null;
  staleMs: number;

  filters: AdminFilters;

  setFilter: (key: keyof AdminFilters, value: string) => void;
  resetFilters: () => void;

  // fetching
  fetchAll: (opts?: FetchAllOpts) => Promise<void>;
  fetchAllIfNeeded: () => Promise<void>;

  create: (payload: FolkloreCreateDto) => Promise<Folklore | null>;
  update: (id: number, payload: FolkloreUpdateDto) => Promise<Folklore | null>;
  remove: (id: number) => Promise<boolean>;

  getFilteredItems: () => Folklore[];
}

export const useFolkloreAdminStore = create<FolkloreAdminState>((set, get) => ({
  items: [],
  loading: false,

  lastLoadedAt: null,
  staleMs: 20_000, // 20 секунд - можешь поменять

  filters: { search: "", type: "", region: "" },

  setFilter: (key, value) =>
    set((s) => ({ filters: { ...s.filters, [key]: value } })),

  resetFilters: () => set({ filters: { search: "", type: "", region: "" } }),

  fetchAllIfNeeded: async () => {
    const { items, lastLoadedAt, staleMs } = get();
    const isEmpty = items.length === 0;
    const isStale = !lastLoadedAt || Date.now() - lastLoadedAt > staleMs;
    if (isEmpty || isStale) {
      await get().fetchAll({ force: true });
    }
  },

  fetchAll: async (opts) => {
    const { force = false, silent = false } = opts ?? {};
    const { lastLoadedAt, staleMs, items } = get();

    const isStale = !lastLoadedAt || Date.now() - lastLoadedAt > staleMs;

    // если не force и уже есть данные и они свежие - не грузим
    if (!force && items.length > 0 && !isStale) return;

    if (!silent) set({ loading: true });

    try {
      const data = await FolkloreAdminService.getAll();
      set({ items: data, lastLoadedAt: Date.now() });
    } catch (e) {
      useUiStore.getState().showSnackbar(getErrorMessage(e), "error");
    } finally {
      if (!silent) set({ loading: false });
    }
  },

  create: async (payload) => {
    set({ loading: true });
    try {
      const created = await FolkloreAdminService.create(payload);

      // быстрый локальный апдейт
      set((s) => ({ items: [created, ...s.items], lastLoadedAt: Date.now() }));

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
        lastLoadedAt: Date.now(),
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

      set((s) => ({
        items: s.items.filter((x) => x.id !== id),
        lastLoadedAt: Date.now(),
      }));

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
