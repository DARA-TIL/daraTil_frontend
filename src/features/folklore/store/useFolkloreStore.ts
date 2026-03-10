import { create } from "zustand";
import FolkloreService, {
  type FolkloreSearchParams,
} from "../api/FolkloreService";
import type { Folklore } from "../model/types";
import axios from "axios";
import { useUiStore } from "@/shared/store/useUiStore";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

type LoadMode = "all" | "search";

interface FolkloreState {
  items: Folklore[];
  loading: boolean;
  loadMode: LoadMode;

  // filters
  search: string;
  type: string;
  region: string;

  selectedId: number | null;
  selected: Folklore | null;
  detailsLoading: boolean;

  likedIds: Record<number, boolean>; // id -> liked (локально)
  minLikes: string;

  setSearch: (v: string) => void;
  setType: (v: string) => void;
  setRegion: (v: string) => void;
  clearFilters: () => void;

  fetchAll: () => Promise<void>;
  fetchSearch: () => Promise<void>;
  fetchLiked: () => Promise<void>;
  openDetails: (id: number) => Promise<void>;
  closeDetails: () => void;

  toggleLike: (id: number) => Promise<void>;
  setMinLikes: (v: string) => void;

  hasActiveFilters: () => boolean;
  applyFilters: () => Promise<void>;
}

function getErrorMessage(e: unknown): string {
  if (axios.isAxiosError(e)) {
    const backendError = (e.response?.data as any)?.error;
    if (backendError) return String(backendError);
  }
  return "Something went wrong. Please try again.";
}

function mergeFolklore(prev: Folklore, next: Partial<Folklore>): Folklore {
  return {
    ...prev,
    ...next,
    content: next.content ?? prev.content,
    translations: next.translations ?? prev.translations,
  };
}

export const useFolkloreStore = create<FolkloreState>((set, get) => ({
  items: [],
  loading: false,
  loadMode: "all",

  search: "",
  type: "",
  region: "",

  selectedId: null,
  selected: null,
  detailsLoading: false,

  likedIds: {},
  minLikes: "",

  setSearch: (v) => set({ search: v }),
  setType: (v) => set({ type: v }),
  setRegion: (v) => set({ region: v }),
  setMinLikes: (v) => set({ minLikes: v }),
  clearFilters: () => set({ search: "", type: "", region: "", minLikes: "" }),

  hasActiveFilters: () => {
    const { search, type, region, minLikes } = get();
    return Boolean(search.trim() || type || region || minLikes.trim() !== "");
  },

  applyFilters: async () => {
    const { hasActiveFilters, fetchAll, fetchSearch } = get();
    if (hasActiveFilters()) {
      await fetchSearch();
    } else {
      await fetchAll();
    }
  },

  fetchAll: async () => {
    set({ loading: true, loadMode: "all" });
    try {
      const data = await FolkloreService.getAll();
      set({ items: data });
    } catch (e) {
      useUiStore.getState().showSnackbar(getErrorMessage(e), "error");
    } finally {
      set({ loading: false });
    }
  },

  fetchSearch: async () => {
    const { search, type, region, minLikes } = get();

    const params: FolkloreSearchParams = {
      search: search.trim() || undefined,
      type: type || undefined,
      region: region || undefined,
      minLikes: minLikes ? Number(minLikes) : undefined,
    };

    set({ loading: true, loadMode: "search" });

    try {
      const data = await FolkloreService.search(params);
      set({ items: data });
    } catch (e) {
      // если упало и minLikes был - попробуем без него
      if (minLikes.trim() !== "") {
        useUiStore
          .getState()
          .showSnackbar(
            "minLikes filter is not supported yet - showing results without it.",
            "warning",
          );

        try {
          const data = await FolkloreService.search({
            ...params,
            minLikes: undefined,
          });
          set({ items: data, minLikes: "" });
          return;
        } catch (e2) {
          useUiStore.getState().showSnackbar(getErrorMessage(e2), "error");
        }
      } else {
        useUiStore.getState().showSnackbar(getErrorMessage(e), "error");
      }
    } finally {
      set({ loading: false });
    }
  },

  fetchLiked: async () => {
    try {
      const likedItems = await FolkloreService.getLiked();

      // важно: бек может вернуть ID, поэтому лучше использовать normalize на сервисе
      const map: Record<number, boolean> = {};
      likedItems.forEach((x) => {
        map[x.id] = true;
      });

      set({ likedIds: map });
    } catch (e) {
      // это не критично, можно не шуметь
      // useUiStore.getState().showSnackbar(getErrorMessage(e), "error");
    }
  },

  openDetails: async (id) => {
    if (!id || Number.isNaN(Number(id))) {
      useUiStore.getState().showSnackbar("Invalid folklore id", "error");
      return;
    }

    set({ selectedId: id, detailsLoading: true });
    try {
      const full = await FolkloreService.getById(id);
      set({ selected: full.data });
      useAuthStore.getState().applyStreakUpdate(full.streak);
    } catch (e) {
      useUiStore.getState().showSnackbar(getErrorMessage(e), "error");
      set({ selectedId: null, selected: null });
    } finally {
      set({ detailsLoading: false });
    }
  },

  closeDetails: () => set({ selectedId: null, selected: null }),

  toggleLike: async (id) => {
    const { likedIds, items, selected } = get();

    const hasKnownState = Object.prototype.hasOwnProperty.call(likedIds, id);
    const wasLiked = Boolean(likedIds[id]);

    if (!hasKnownState) {
      try {
        const res = await FolkloreService.toggleLike(id);
        useAuthStore.getState().applyStreakUpdate(res.streak);

        set((s) => ({
          likedIds: { ...s.likedIds, [id]: res.liked },
          items: s.items.map((x) =>
            x.id === id ? mergeFolklore(x, res.data) : x,
          ),
          selected:
            s.selected?.id === id
              ? mergeFolklore(s.selected, res.data)
              : s.selected,
        }));
      } catch (e) {
        useUiStore.getState().showSnackbar(getErrorMessage(e), "error");
      }
      return;
    }

    // optimistic update
    set({
      likedIds: { ...likedIds, [id]: !wasLiked },
      items: items.map((x: Folklore) =>
        x.id === id
          ? {
              ...x,
              likesCount: Math.max(0, x.likesCount + (wasLiked ? -1 : 1)),
            }
          : x,
      ),
      selected:
        selected?.id === id
          ? {
              ...selected,
              likesCount: Math.max(
                0,
                selected.likesCount + (wasLiked ? -1 : 1),
              ),
            }
          : selected,
    });

    try {
      const res = await FolkloreService.toggleLike(id);
      useAuthStore.getState().applyStreakUpdate(res.streak);

      // strict sync from server response
      set((s) => {
        const mergeFolklore = (prev: Folklore, next: Folklore): Folklore => ({
          ...prev,
          ...next,
          // translations часто НЕ приходит в like-ответе
          translations: next.translations ?? prev.translations,
        });

        return {
          likedIds: { ...s.likedIds, [id]: res.liked },
          items: s.items.map((x) =>
            x.id === id ? mergeFolklore(x, res.data) : x,
          ),
          selected:
            s.selected?.id === id
              ? mergeFolklore(s.selected, res.data)
              : s.selected,
        };
      });
    } catch (e) {
      // rollback
      const msg = getErrorMessage(e);
      useUiStore.getState().showSnackbar(msg, "error");

      set((s) => ({
        likedIds: { ...s.likedIds, [id]: wasLiked },
        items: s.items.map((x) =>
          x.id === id
            ? {
                ...x,
                likesCount: Math.max(0, x.likesCount + (wasLiked ? 1 : -1)),
              }
            : x,
        ),
        selected:
          s.selected?.id === id
            ? {
                ...s.selected,
                likesCount: Math.max(
                  0,
                  s.selected.likesCount + (wasLiked ? 1 : -1),
                ),
              }
            : s.selected,
      }));
    }
  },
}));
