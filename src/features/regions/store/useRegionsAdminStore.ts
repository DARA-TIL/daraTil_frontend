import { create } from "zustand";
import type {
  Region,
  RegionCreateDto,
  RegionSlangCreateDto,
  RegionSlangTranslationCreateDto,
  RegionSlangTranslationUpdateDto,
  RegionTraditionCreateDto,
  RegionTraditionTranslationCreateDto,
  RegionTraditionTranslationUpdateDto,
  RegionTranslationCreateDto,
  RegionTranslationUpdateDto,
  RegionUpdateDto,
} from "../model/types";
import RegionService from "../api/RegionService";
import RegionAdminService from "../api/RegionAdminService";
import { getApiErrorMessage } from "@/shared/lib/getApiErrorMessage";
import { useUiStore } from "@/shared/store/useUiStore";

type Filters = {
  search: string;
  kind: string;
  state: string;
};

type RegionsAdminState = {
  items: Region[];
  selectedId: number | null;
  selected: Region | null;
  loading: boolean;
  selectedLoading: boolean;
  actionLoading: boolean;
  filters: Filters;
  setFilter: (key: keyof Filters, value: string) => void;
  resetFilters: () => void;
  getFilteredItems: () => Region[];
  fetchAll: (force?: boolean) => Promise<void>;
  selectById: (id: number) => Promise<Region | null>;
  refreshSelected: () => Promise<Region | null>;
  clearSelected: () => void;
  createRegion: (payload: RegionCreateDto) => Promise<boolean>;
  createAllRegions: () => Promise<boolean>;
  updateRegion: (payload: RegionUpdateDto) => Promise<boolean>;
  deleteRegion: (id: number) => Promise<boolean>;
  createTranslation: (payload: RegionTranslationCreateDto) => Promise<boolean>;
  updateTranslation: (payload: RegionTranslationUpdateDto) => Promise<boolean>;
  deleteTranslation: (id: number) => Promise<boolean>;
  createSlang: (payload: RegionSlangCreateDto) => Promise<boolean>;
  deleteSlang: (id: number) => Promise<boolean>;
  createSlangTranslation: (
    payload: RegionSlangTranslationCreateDto,
  ) => Promise<boolean>;
  updateSlangTranslation: (
    payload: RegionSlangTranslationUpdateDto,
  ) => Promise<boolean>;
  deleteSlangTranslation: (id: number) => Promise<boolean>;
  createTradition: (payload: RegionTraditionCreateDto) => Promise<boolean>;
  deleteTradition: (id: number) => Promise<boolean>;
  createTraditionTranslation: (
    payload: RegionTraditionTranslationCreateDto,
  ) => Promise<boolean>;
  updateTraditionTranslation: (
    payload: RegionTraditionTranslationUpdateDto,
  ) => Promise<boolean>;
  deleteTraditionTranslation: (id: number) => Promise<boolean>;
};

function mergeRegion(items: Region[], region: Region): Region[] {
  const found = items.some((item) => item.id === region.id);
  if (!found) return [region, ...items];

  return items.map((item) => (item.id === region.id ? region : item));
}

function toSearchBlob(region: Region) {
  return [
    region.code,
    region.kind,
    region.regionStatus,
    ...region.translations.flatMap((translation) => [
      translation.language,
      translation.name,
      translation.description,
    ]),
  ]
    .join(" ")
    .toLowerCase();
}

export const useRegionsAdminStore = create<RegionsAdminState>((set, get) => {
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

  async function fetchSelected(id: number): Promise<Region | null> {
    set({ selectedId: id, selectedLoading: true });

    try {
      const region = await RegionService.getById(id);
      set((state) => ({
        selectedId: id,
        selected: region,
        items: mergeRegion(state.items, region),
      }));
      return region;
    } catch (error) {
      const message =
        getApiErrorMessage(error) ?? "Failed to load selected region";
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
      kind: "",
      state: "",
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
          kind: "",
          state: "",
        },
      }),

    getFilteredItems: () => {
      const { items, filters } = get();
      const query = filters.search.trim().toLowerCase();

      return items.filter((item) => {
        if (filters.kind && item.kind !== filters.kind) return false;
        if (filters.state === "active" && !item.isActive) return false;
        if (filters.state === "inactive" && item.isActive) return false;
        if (!query) return true;

        return toSearchBlob(item).includes(query);
      });
    },

    fetchAll: async (force = false) => {
      const { loading, items, selectedId } = get();
      if (loading) return;
      if (!force && items.length > 0) return;

      set({ loading: true });
      try {
        const regions = await RegionService.getAll();
        set((state) => ({
          items: regions,
          selected:
            selectedId === null
              ? state.selected
              : regions.find((item) => item.id === selectedId) ?? state.selected,
        }));
      } catch (error) {
        const message =
          getApiErrorMessage(error) ?? "Failed to load regions for admin";
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

    createRegion: async (payload) => {
      const result = await withAction(async () => {
        await RegionAdminService.createRegion(payload);
        await get().fetchAll(true);
        return true;
      }, "Failed to create region");

      return Boolean(result);
    },

    createAllRegions: async () => {
      const result = await withAction(async () => {
        await RegionAdminService.createAllRegions();
        await get().fetchAll(true);
        return true;
      }, "Failed to import regions");

      return Boolean(result);
    },

    updateRegion: async (payload) => {
      const result = await withAction(async () => {
        await RegionAdminService.updateRegion(payload);
        await fetchSelected(payload.id);
        return true;
      }, "Failed to update region");

      return Boolean(result);
    },

    deleteRegion: async (id) => {
      const result = await withAction(async () => {
        await RegionAdminService.deleteRegion(id);
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
          selectedId: state.selectedId === id ? null : state.selectedId,
          selected: state.selectedId === id ? null : state.selected,
        }));
        return true;
      }, "Failed to delete region");

      return Boolean(result);
    },

    createTranslation: async (payload) => {
      const result = await withAction(async () => {
        await RegionAdminService.createTranslation(payload);
        await get().refreshSelected();
        return true;
      }, "Failed to create region translation");

      return Boolean(result);
    },

    updateTranslation: async (payload) => {
      const result = await withAction(async () => {
        await RegionAdminService.updateTranslation(payload);
        await get().refreshSelected();
        return true;
      }, "Failed to update region translation");

      return Boolean(result);
    },

    deleteTranslation: async (id) => {
      const result = await withAction(async () => {
        await RegionAdminService.deleteTranslation(id);
        await get().refreshSelected();
        return true;
      }, "Failed to delete region translation");

      return Boolean(result);
    },

    createSlang: async (payload) => {
      const result = await withAction(async () => {
        await RegionAdminService.createSlang(payload);
        await get().refreshSelected();
        return true;
      }, "Failed to create region slang");

      return Boolean(result);
    },

    deleteSlang: async (id) => {
      const result = await withAction(async () => {
        await RegionAdminService.deleteSlang(id);
        await get().refreshSelected();
        return true;
      }, "Failed to delete region slang");

      return Boolean(result);
    },

    createSlangTranslation: async (payload) => {
      const result = await withAction(async () => {
        await RegionAdminService.createSlangTranslation(payload);
        await get().refreshSelected();
        return true;
      }, "Failed to create slang translation");

      return Boolean(result);
    },

    updateSlangTranslation: async (payload) => {
      const result = await withAction(async () => {
        await RegionAdminService.updateSlangTranslation(payload);
        await get().refreshSelected();
        return true;
      }, "Failed to update slang translation");

      return Boolean(result);
    },

    deleteSlangTranslation: async (id) => {
      const result = await withAction(async () => {
        await RegionAdminService.deleteSlangTranslation(id);
        await get().refreshSelected();
        return true;
      }, "Failed to delete slang translation");

      return Boolean(result);
    },

    createTradition: async (payload) => {
      const result = await withAction(async () => {
        await RegionAdminService.createTradition(payload);
        await get().refreshSelected();
        return true;
      }, "Failed to create region tradition");

      return Boolean(result);
    },

    deleteTradition: async (id) => {
      const result = await withAction(async () => {
        await RegionAdminService.deleteTradition(id);
        await get().refreshSelected();
        return true;
      }, "Failed to delete region tradition");

      return Boolean(result);
    },

    createTraditionTranslation: async (payload) => {
      const result = await withAction(async () => {
        await RegionAdminService.createTraditionTranslation(payload);
        await get().refreshSelected();
        return true;
      }, "Failed to create tradition translation");

      return Boolean(result);
    },

    updateTraditionTranslation: async (payload) => {
      const result = await withAction(async () => {
        await RegionAdminService.updateTraditionTranslation(payload);
        await get().refreshSelected();
        return true;
      }, "Failed to update tradition translation");

      return Boolean(result);
    },

    deleteTraditionTranslation: async (id) => {
      const result = await withAction(async () => {
        await RegionAdminService.deleteTraditionTranslation(id);
        await get().refreshSelected();
        return true;
      }, "Failed to delete tradition translation");

      return Boolean(result);
    },
  };
});
