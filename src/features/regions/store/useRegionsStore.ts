import { create } from "zustand";
import type { Region } from "../model/types";
import RegionService from "../api/RegionService";
import { getApiErrorMessage } from "@/shared/lib/getApiErrorMessage";
import { useUiStore } from "@/shared/store/useUiStore";

type RegionCache = Record<string, Region>;

interface RegionsState {
  items: Region[];
  itemsLoading: boolean;
  selectedCode: string | null;
  selectedRegion: Region | null;
  selectedLoading: boolean;
  cache: RegionCache;
  fetchAll: (force?: boolean) => Promise<void>;
  selectByCode: (code: string) => Promise<void>;
  clearSelected: () => void;
  getRegionByCode: (code: string) => Region | null;
}

export const useRegionsStore = create<RegionsState>((set, get) => ({
  items: [],
  itemsLoading: false,
  selectedCode: null,
  selectedRegion: null,
  selectedLoading: false,
  cache: {},

  fetchAll: async (force = false) => {
    const { itemsLoading, items } = get();
    if (itemsLoading) return;
    if (!force && items.length > 0) return;

    set({ itemsLoading: true });

    try {
      const regions = await RegionService.getAll();
      set((state) => ({
        items: regions,
        cache: {
          ...state.cache,
          ...Object.fromEntries(
            regions
              .filter((region) => Boolean(region.code))
              .map((region) => [region.code, region]),
          ),
        },
      }));
    } catch (error) {
      const message =
        getApiErrorMessage(error) ?? "Failed to load Kazakhstan regions";
      useUiStore.getState().showSnackbar(message, "error");
    } finally {
      set({ itemsLoading: false });
    }
  },

  selectByCode: async (code) => {
    const normalizedCode = code.trim();
    if (!normalizedCode) return;

    const cached = get().cache[normalizedCode];
    if (cached) {
      set({
        selectedCode: normalizedCode,
        selectedRegion: cached,
        selectedLoading: false,
      });
      return;
    }

    set({
      selectedCode: normalizedCode,
      selectedRegion: null,
      selectedLoading: true,
    });

    try {
      const response = await RegionService.getByCode(normalizedCode);
      const region = response[0] ?? get().items.find((item) => item.code === normalizedCode) ?? null;

      if (!region) {
        throw new Error(`Region "${normalizedCode}" not found`);
      }

      set((state) => ({
        selectedRegion: region,
        selectedLoading: false,
        cache: {
          ...state.cache,
          [normalizedCode]: region,
        },
      }));
    } catch (error) {
      const fallback =
        get().items.find((item) => item.code === normalizedCode) ?? null;

      if (fallback) {
        set((state) => ({
          selectedRegion: fallback,
          selectedLoading: false,
          cache: {
            ...state.cache,
            [normalizedCode]: fallback,
          },
        }));
        return;
      }

      const message =
        getApiErrorMessage(error) ?? "Failed to load region details";
      useUiStore.getState().showSnackbar(message, "error");
      set({ selectedLoading: false, selectedRegion: null });
    }
  },

  clearSelected: () =>
    set({
      selectedCode: null,
      selectedRegion: null,
      selectedLoading: false,
    }),

  getRegionByCode: (code) => {
    const normalizedCode = code.trim();
    if (!normalizedCode) return null;

    return (
      get().cache[normalizedCode] ??
      get().items.find((item) => item.code === normalizedCode) ??
      null
    );
  },
}));
