import { create } from "zustand";
import NotificationsService from "../api/NotificationsService";
import type {
  AppNotification,
  CreateNotificationPayload,
  NotificationQuery,
  NotificationScope,
  NotificationType,
  UpdateNotificationPayload,
} from "../model/types";
import { getApiErrorMessage } from "@/shared/lib/getApiErrorMessage";
import { useUiStore } from "@/shared/store/useUiStore";

type AdminFilters = {
  search: string;
  type: NotificationType | "all";
  scope: NotificationScope | "all";
  limit: number;
};

type NotificationsAdminState = {
  items: AppNotification[];
  loading: boolean;
  actionLoading: boolean;
  selectedId: number | null;
  filters: AdminFilters;
  fetchAll: (force?: boolean) => Promise<void>;
  create: (payload: CreateNotificationPayload) => Promise<AppNotification | null>;
  update: (payload: UpdateNotificationPayload) => Promise<AppNotification | null>;
  deleteById: (id: number) => Promise<boolean>;
  selectById: (id: number | null) => void;
  setFilter: <K extends keyof AdminFilters>(
    key: K,
    value: AdminFilters[K],
  ) => void;
  resetFilters: () => void;
  getFilteredItems: () => AppNotification[];
};

const DEFAULT_FILTERS: AdminFilters = {
  search: "",
  type: "all",
  scope: "all",
  limit: 100,
};

function buildQuery(filters: AdminFilters): NotificationQuery {
  return {
    type: filters.type === "all" ? undefined : filters.type,
    scope: filters.scope === "all" ? undefined : filters.scope,
    limit: filters.limit,
  };
}

function sortItems(items: AppNotification[]): AppNotification[] {
  return [...items].sort((left, right) => {
    const leftTime = Date.parse(left.createdAt || "") || 0;
    const rightTime = Date.parse(right.createdAt || "") || 0;
    return rightTime - leftTime || right.id - left.id;
  });
}

export const useNotificationsAdminStore = create<NotificationsAdminState>(
  (set, get) => ({
    items: [],
    loading: false,
    actionLoading: false,
    selectedId: null,
    filters: DEFAULT_FILTERS,

    fetchAll: async () => {
      set({ loading: true });
      try {
        const response = await NotificationsService.getAll(
          buildQuery(get().filters),
        );
        set({ items: sortItems(response.items) });
      } catch (error) {
        const message =
          getApiErrorMessage(error) ?? "Failed to load notifications";
        useUiStore.getState().showSnackbar(message, "error");
      } finally {
        set({ loading: false });
      }
    },

    create: async (payload) => {
      set({ actionLoading: true });
      try {
        const created = await NotificationsService.create(payload);
        await get().fetchAll(true);
        useUiStore
          .getState()
          .showSnackbar("Notification created", "success");
        return created;
      } catch (error) {
        const message =
          getApiErrorMessage(error) ?? "Failed to create notification";
        useUiStore.getState().showSnackbar(message, "error");
        return null;
      } finally {
        set({ actionLoading: false });
      }
    },

    update: async (payload) => {
      set({ actionLoading: true });
      try {
        const updated = await NotificationsService.update(payload);
        await get().fetchAll(true);
        useUiStore
          .getState()
          .showSnackbar("Notification saved", "success");
        return updated;
      } catch (error) {
        const message =
          getApiErrorMessage(error) ?? "Failed to update notification";
        useUiStore.getState().showSnackbar(message, "error");
        return null;
      } finally {
        set({ actionLoading: false });
      }
    },

    deleteById: async (id) => {
      set({ actionLoading: true });
      try {
        await NotificationsService.deleteById(id);
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
          selectedId: state.selectedId === id ? null : state.selectedId,
        }));
        useUiStore
          .getState()
          .showSnackbar("Notification deleted", "success");
        return true;
      } catch (error) {
        const message =
          getApiErrorMessage(error) ?? "Failed to delete notification";
        useUiStore.getState().showSnackbar(message, "error");
        return false;
      } finally {
        set({ actionLoading: false });
      }
    },

    selectById: (id) => set({ selectedId: id }),

    setFilter: (key, value) =>
      set((state) => ({
        filters: {
          ...state.filters,
          [key]: value,
        },
      })),

    resetFilters: () =>
      set({
        filters: DEFAULT_FILTERS,
      }),

    getFilteredItems: () => {
      const { items, filters } = get();
      const query = filters.search.trim().toLowerCase();

      return items.filter((item) => {
        if (!query) return true;
        return [item.title, item.message, item.type, item.scope, item.userId]
          .join(" ")
          .toLowerCase()
          .includes(query);
      });
    },
  }),
);
