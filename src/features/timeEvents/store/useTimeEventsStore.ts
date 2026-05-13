import { create } from "zustand";
import { getApiErrorMessage } from "@/shared/lib/getApiErrorMessage";
import { useUiStore } from "@/shared/store/useUiStore";
import TimeEventsService from "../api/TimeEventsService";
import { getFeaturedTimeEvent, sortTimeEventsByPriority } from "../model/presentation";
import type {
  TimeEvent,
  TimeEventParticipant,
  TimeEventQuery,
} from "../model/types";

type ParticipantCacheEntry = {
  items: TimeEventParticipant[];
  limit: number;
};

type TimeEventsState = {
  items: TimeEvent[];
  loading: boolean;
  participantsByEventId: Record<number, ParticipantCacheEntry>;
  participantsLoadingEventId: number | null;
  lastQueryKey: string;
  fetchAll: (filters?: TimeEventQuery, force?: boolean) => Promise<TimeEvent[]>;
  fetchParticipants: (
    eventId: number,
    limit: number,
    force?: boolean,
  ) => Promise<TimeEventParticipant[]>;
  getParticipants: (eventId: number) => TimeEventParticipant[];
  getFeaturedEvent: () => TimeEvent | null;
};

function queryKey(filters: TimeEventQuery): string {
  return JSON.stringify(filters);
}

export const useTimeEventsStore = create<TimeEventsState>((set, get) => ({
  items: [],
  loading: false,
  participantsByEventId: {},
  participantsLoadingEventId: null,
  lastQueryKey: "",

  fetchAll: async (filters = {}, force = false) => {
    const nextKey = queryKey(filters);
    if (get().loading) return get().items;
    if (!force && get().items.length > 0 && get().lastQueryKey === nextKey) {
      return get().items;
    }

    set({ loading: true });
    try {
      const items = sortTimeEventsByPriority(await TimeEventsService.getAll(filters));
      set({
        items,
        lastQueryKey: nextKey,
      });
      return items;
    } catch (error) {
      const message = getApiErrorMessage(error) ?? "Failed to load time events";
      useUiStore.getState().showSnackbar(message, "error");
      return get().items;
    } finally {
      set({ loading: false });
    }
  },

  fetchParticipants: async (eventId, limit, force = false) => {
    const cached = get().participantsByEventId[eventId];
    if (!force && cached && cached.limit >= limit) {
      return cached.items.slice(0, limit);
    }

    set({ participantsLoadingEventId: eventId });
    try {
      const items = await TimeEventsService.getEventParticipants(eventId, limit);
      set((state) => ({
        participantsByEventId: {
          ...state.participantsByEventId,
          [eventId]: {
            items,
            limit,
          },
        },
      }));
      return items;
    } catch (error) {
      const message =
        getApiErrorMessage(error) ?? "Failed to load event participants";
      useUiStore.getState().showSnackbar(message, "error");
      return cached?.items ?? [];
    } finally {
      set({ participantsLoadingEventId: null });
    }
  },

  getParticipants: (eventId) => get().participantsByEventId[eventId]?.items ?? [],

  getFeaturedEvent: () => getFeaturedTimeEvent(get().items),
}));
