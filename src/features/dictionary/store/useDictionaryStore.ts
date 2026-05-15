import { create } from "zustand";
import DictionaryService from "../api/DictionaryService";
import type {
  DictionaryCreateDto,
  DictionaryEntry,
  DictionaryFavoriteWordRequest,
  DictionaryUpdateDto,
} from "../model/types";
import { getApiErrorMessage } from "@/shared/lib/getApiErrorMessage";
import { useUiStore } from "@/shared/store/useUiStore";

type DictionaryCache = Record<number, DictionaryEntry>;

interface DictionaryState {
  items: DictionaryEntry[];
  loading: boolean;
  currentQuery: string;
  favoriteIds: Record<number, boolean>;
  selectedId: number | null;
  selectedItem: DictionaryEntry | null;
  selectedLoading: boolean;
  cache: DictionaryCache;
  fetchCollection: (force?: boolean) => Promise<void>;
  searchByWord: (word: string) => Promise<void>;
  selectById: (id: number, force?: boolean) => Promise<void>;
  clearSelected: () => void;
  createEntry: (payload: DictionaryCreateDto) => Promise<DictionaryEntry | null>;
  updateEntry: (payload: DictionaryUpdateDto) => Promise<DictionaryEntry | null>;
  deleteEntry: (id: number) => Promise<boolean>;
  favoriteWord: (payload: DictionaryFavoriteWordRequest) => Promise<DictionaryEntry | null>;
  addFavorite: (id: number) => Promise<boolean>;
  removeFavorite: (id: number) => Promise<boolean>;
  refreshFavorites: () => Promise<void>;
}

function mapById(items: DictionaryEntry[]): DictionaryCache {
  return Object.fromEntries(items.map((item) => [item.id, item]));
}

function mergeCache(base: DictionaryCache, items: DictionaryEntry[]): DictionaryCache {
  return {
    ...base,
    ...mapById(items),
  };
}

function getFallbackError(error: unknown, fallback: string): string {
  return getApiErrorMessage(error) ?? fallback;
}

export const useDictionaryStore = create<DictionaryState>((set, get) => ({
  items: [],
  loading: false,
  currentQuery: "",
  favoriteIds: {},
  selectedId: null,
  selectedItem: null,
  selectedLoading: false,
  cache: {},

  refreshFavorites: async () => {
    try {
      const favorites = await DictionaryService.getFavorites();
      set((state) => ({
        favoriteIds: Object.fromEntries(favorites.map((item) => [item.id, true])),
        cache: mergeCache(state.cache, favorites),
      }));
    } catch (error) {
      const message = getFallbackError(error, "Failed to load dictionary favorites");
      useUiStore.getState().showSnackbar(message, "error");
    }
  },

  fetchCollection: async (force = false) => {
    const { loading, currentQuery } = get();
    if (loading) return;
    if (!force && currentQuery === "" && get().items.length > 0) {
      return;
    }

    set({ loading: true, currentQuery: "" });

    try {
      const [items, favorites] = await Promise.all([
        DictionaryService.getAll(),
        DictionaryService.getFavorites().catch(() => []),
      ]);

      set((state) => ({
        items,
        favoriteIds: Object.fromEntries(favorites.map((item) => [item.id, true])),
        cache: mergeCache(state.cache, [...items, ...favorites]),
        selectedItem:
          state.selectedId !== null
            ? mergeCache(state.cache, [...items, ...favorites])[state.selectedId] ??
              state.selectedItem
            : state.selectedItem,
      }));
    } catch (error) {
      const message = getFallbackError(error, "Failed to load dictionary entries");
      useUiStore.getState().showSnackbar(message, "error");
    } finally {
      set({ loading: false });
    }
  },

  searchByWord: async (word) => {
    const query = word.trim();
    if (!query) {
      await get().fetchCollection(true);
      return;
    }

    set({ loading: true, currentQuery: query });

    try {
      const items = await DictionaryService.getByWord(query);
      set((state) => ({
        items,
        cache: mergeCache(state.cache, items),
      }));
    } catch (error) {
      const message = getFallbackError(error, "Failed to search dictionary");
      useUiStore.getState().showSnackbar(message, "error");
    } finally {
      set({ loading: false });
    }
  },

  selectById: async (id, force = false) => {
    if (!id || Number.isNaN(Number(id))) return;

    const cached = get().cache[id] ?? get().items.find((item) => item.id === id) ?? null;

    set({
      selectedId: id,
      selectedItem: cached,
      selectedLoading: !cached,
    });

    if (!force && cached) {
      void DictionaryService.getById(id)
        .then((item) => {
          set((state) => ({
            selectedItem: state.selectedId === id ? item : state.selectedItem,
            selectedLoading: state.selectedId === id ? false : state.selectedLoading,
            cache: {
              ...state.cache,
              [id]: item,
            },
          }));
        })
        .catch(() => {
          set((state) => ({
            selectedLoading: state.selectedId === id ? false : state.selectedLoading,
          }));
        });
      return;
    }

    try {
      const item = await DictionaryService.getById(id);
      set((state) => ({
        selectedItem: item,
        selectedLoading: false,
        cache: {
          ...state.cache,
          [id]: item,
        },
      }));
    } catch (error) {
      const message = getFallbackError(error, "Failed to load dictionary entry");
      useUiStore.getState().showSnackbar(message, "error");
      set({ selectedLoading: false });
    }
  },

  clearSelected: () =>
    set({
      selectedId: null,
      selectedItem: null,
      selectedLoading: false,
    }),

  createEntry: async (payload) => {
    try {
      const created = await DictionaryService.create(payload);
      await get().fetchCollection(true);
      await get().refreshFavorites();

      const createdWord = payload.originalWord.trim().toLowerCase();
      const matched =
        created ??
        get().items.find((item) => item.originalWord.trim().toLowerCase() === createdWord) ??
        null;

      if (matched) {
        set((state) => ({
          cache: {
            ...state.cache,
            [matched.id]: matched,
          },
        }));
      }

      return matched;
    } catch (error) {
      const message = getFallbackError(error, "Failed to create dictionary entry");
      useUiStore.getState().showSnackbar(message, "error");
      return null;
    }
  },

  updateEntry: async (payload) => {
    try {
      const updated = await DictionaryService.update(payload);
      await get().fetchCollection(true);
      await get().refreshFavorites();

      const matched = updated ?? get().cache[payload.id] ?? null;
      if (matched) {
        set((state) => ({
          cache: {
            ...state.cache,
            [matched.id]: matched,
          },
          selectedItem: state.selectedId === matched.id ? matched : state.selectedItem,
        }));
      }

      return matched;
    } catch (error) {
      const message = getFallbackError(error, "Failed to update dictionary entry");
      useUiStore.getState().showSnackbar(message, "error");
      return null;
    }
  },

  deleteEntry: async (id) => {
    try {
      await DictionaryService.delete(id);
      set((state) => {
        const nextCache = { ...state.cache };
        delete nextCache[id];

        const nextFavorites = { ...state.favoriteIds };
        delete nextFavorites[id];

        return {
          items: state.items.filter((item) => item.id !== id),
          cache: nextCache,
          favoriteIds: nextFavorites,
          selectedId: state.selectedId === id ? null : state.selectedId,
          selectedItem: state.selectedId === id ? null : state.selectedItem,
          selectedLoading: state.selectedId === id ? false : state.selectedLoading,
        };
      });
      return true;
    } catch (error) {
      const message = getFallbackError(error, "Failed to delete dictionary entry");
      useUiStore.getState().showSnackbar(message, "error");
      return false;
    }
  },

  favoriteWord: async (payload) => {
    try {
      const created = await DictionaryService.favoriteWord(payload);
      await get().fetchCollection(true);
      await get().refreshFavorites();

      const createdWord = payload.word.trim().toLowerCase();
      const matched =
        created ??
        get().items.find((item) => item.originalWord.trim().toLowerCase() === createdWord) ??
        null;

      if (matched) {
        set((state) => ({
          favoriteIds: {
            ...state.favoriteIds,
            [matched.id]: true,
          },
          cache: {
            ...state.cache,
            [matched.id]: matched,
          },
        }));
      }

      return matched;
    } catch (error) {
      const message = getFallbackError(error, "Failed to save favorite word");
      useUiStore.getState().showSnackbar(message, "error");
      return null;
    }
  },

  addFavorite: async (id) => {
    try {
      await DictionaryService.addFavorite(id);
      set((state) => ({
        favoriteIds: {
          ...state.favoriteIds,
          [id]: true,
        },
      }));
      await get().refreshFavorites();
      return true;
    } catch (error) {
      const message = getFallbackError(error, "Failed to add dictionary favorite");
      useUiStore.getState().showSnackbar(message, "error");
      return false;
    }
  },

  removeFavorite: async (id) => {
    try {
      await DictionaryService.removeFavorite(id);
      set((state) => {
        const nextFavorites = { ...state.favoriteIds };
        delete nextFavorites[id];
        return { favoriteIds: nextFavorites };
      });
      await get().refreshFavorites();
      return true;
    } catch (error) {
      const message = getFallbackError(error, "Failed to remove dictionary favorite");
      useUiStore.getState().showSnackbar(message, "error");
      return false;
    }
  },
}));
