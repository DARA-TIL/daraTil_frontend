import { create } from "zustand";
import { getApiErrorMessage } from "@/shared/lib/getApiErrorMessage";
import { useUiStore } from "@/shared/store/useUiStore";
import NotificationsService from "../api/NotificationsService";
import {
  markNotificationRead,
  markNotificationsRead,
} from "../model/normalize";
import type {
  AppNotification,
  NotificationQuery,
} from "../model/types";

type NotificationsState = {
  items: AppNotification[];
  loading: boolean;
  detailLoading: boolean;
  actionLoading: boolean;
  unreadCount: number;
  fetchFeed: (
    query?: NotificationQuery,
    options?: { silent?: boolean },
  ) => Promise<AppNotification[]>;
  fetchById: (id: number) => Promise<AppNotification | null>;
  deleteMine: (id: number) => Promise<boolean>;
  clearMine: () => Promise<boolean>;
  receiveRealtime: (notification: AppNotification) => void;
  reset: () => void;
};

function sortNotifications(items: AppNotification[]): AppNotification[] {
  return [...items].sort((left, right) => {
    const leftTime = Date.parse(left.createdAt || "") || 0;
    const rightTime = Date.parse(right.createdAt || "") || 0;
    return rightTime - leftTime || right.id - left.id;
  });
}

function upsertNotification(
  items: AppNotification[],
  notification: AppNotification,
): AppNotification[] {
  const next = items.filter((item) => item.id !== notification.id);
  next.unshift(notification);
  return sortNotifications(next);
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  items: [],
  loading: false,
  detailLoading: false,
  actionLoading: false,
  unreadCount: 0,

  fetchFeed: async (query = {}, options = {}) => {
    set({ loading: !options.silent });

    try {
      const response = await NotificationsService.getAll(query);
      const items = markNotificationsRead(response.items);

      set({
        items,
        unreadCount: 0,
      });

      return items;
    } catch (error) {
      const message =
        getApiErrorMessage(error) ?? "Failed to load notifications";
      useUiStore.getState().showSnackbar(message, "error");
      return get().items;
    } finally {
      set({ loading: false });
    }
  },

  fetchById: async (id) => {
    if (!id) return null;

    set({ detailLoading: true });
    try {
      const item = await NotificationsService.getById(id);
      if (!item) return null;

      const next = markNotificationRead(item);

      set((state) => ({
        items: upsertNotification(state.items, next),
      }));

      return next;
    } catch (error) {
      const message =
        getApiErrorMessage(error) ?? "Failed to load notification";
      useUiStore.getState().showSnackbar(message, "error");
      return null;
    } finally {
      set({ detailLoading: false });
    }
  },

  deleteMine: async (id) => {
    if (!id) return false;

    set({ actionLoading: true });
    try {
      const target = get().items.find((item) => item.id === id) ?? null;
      await NotificationsService.deleteMine(id);
      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
        unreadCount:
          target && !target.isRead
            ? Math.max(0, state.unreadCount - 1)
            : state.unreadCount,
      }));
      return true;
    } catch (error) {
      const message =
        getApiErrorMessage(error) ?? "Failed to remove notification";
      useUiStore.getState().showSnackbar(message, "error");
      return false;
    } finally {
      set({ actionLoading: false });
    }
  },

  clearMine: async () => {
    set({ actionLoading: true });
    try {
      await NotificationsService.deleteMineAll();
      set({
        items: [],
        unreadCount: 0,
      });
      return true;
    } catch (error) {
      const message =
        getApiErrorMessage(error) ?? "Failed to clear notifications";
      useUiStore.getState().showSnackbar(message, "error");
      return false;
    } finally {
      set({ actionLoading: false });
    }
  },

  receiveRealtime: (notification) =>
    set((state) => {
      const existing = state.items.find((item) => item.id === notification.id) ?? null;
      const nextItems = upsertNotification(state.items, notification);

      const shouldIncrementUnread =
        !notification.isRead && (!existing || existing.isRead);

      return {
        items: nextItems,
        unreadCount: shouldIncrementUnread
          ? state.unreadCount + 1
          : state.unreadCount,
      };
    }),

  reset: () =>
    set({
      items: [],
      loading: false,
      detailLoading: false,
      actionLoading: false,
      unreadCount: 0,
    }),
}));
