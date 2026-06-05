import { create } from "zustand";
import { getApiErrorMessage } from "@/shared/lib/getApiErrorMessage";
import { useUiStore } from "@/shared/store/useUiStore";
import TimeEventsService from "../api/TimeEventsService";
import type {
  TimeEvent,
  TimeEventCreateDto,
  TimeEventParticipant,
  TimeEventParticipantCreateDto,
  TimeEventParticipantUpdateDto,
  TimeEventQuery,
  TimeEventUpdateDto,
} from "../model/types";

type Filters = {
  search: string;
  eventType: string;
  status: string;
  startDateFrom: string;
  startDateTo: string;
  endDateFrom: string;
  endDateTo: string;
};

type TimeEventsAdminState = {
  items: TimeEvent[];
  selectedId: number | null;
  selected: TimeEvent | null;
  participants: TimeEventParticipant[];
  selectedParticipantId: number | null;
  selectedParticipant: TimeEventParticipant | null;
  participantsLimit: number;
  loading: boolean;
  selectedLoading: boolean;
  participantsLoading: boolean;
  selectedParticipantLoading: boolean;
  actionLoading: boolean;
  filters: Filters;
  lastFetchKey: string;
  setFilter: (key: keyof Filters, value: string) => void;
  resetFilters: () => void;
  setParticipantsLimit: (limit: number) => void;
  getFilteredItems: () => TimeEvent[];
  fetchAll: (force?: boolean) => Promise<void>;
  selectById: (id: number) => Promise<TimeEvent | null>;
  clearSelected: () => void;
  fetchParticipants: (limit?: number) => Promise<TimeEventParticipant[]>;
  selectParticipantById: (id: number) => Promise<TimeEventParticipant | null>;
  clearSelectedParticipant: () => void;
  create: (payload: TimeEventCreateDto) => Promise<boolean>;
  update: (payload: TimeEventUpdateDto) => Promise<boolean>;
  finish: (id: number) => Promise<boolean>;
  delete: (id: number) => Promise<boolean>;
  createParticipant: (payload: TimeEventParticipantCreateDto) => Promise<boolean>;
  updateParticipant: (payload: TimeEventParticipantUpdateDto) => Promise<boolean>;
  deleteParticipant: (id: number) => Promise<boolean>;
};

function mergeTimeEvent(items: TimeEvent[], event: TimeEvent): TimeEvent[] {
  const exists = items.some((item) => item.id === event.id);
  if (!exists) return [event, ...items];
  return items.map((item) => (item.id === event.id ? event : item));
}

function sortEvents(items: TimeEvent[]): TimeEvent[] {
  return [...items].sort((left, right) => {
    const rightTime = new Date(right.startDate).getTime();
    const leftTime = new Date(left.startDate).getTime();
    if (Number.isFinite(rightTime) && Number.isFinite(leftTime) && rightTime !== leftTime) {
      return rightTime - leftTime;
    }
    return right.id - left.id;
  });
}

function sortParticipants(
  participants: TimeEventParticipant[],
): TimeEventParticipant[] {
  return [...participants].sort((left, right) => {
    if (left.place > 0 && right.place > 0 && left.place !== right.place) {
      return left.place - right.place;
    }
    if (left.count !== right.count) return right.count - left.count;
    return left.id - right.id;
  });
}

function getServerQuery(filters: Filters): TimeEventQuery {
  return {
    eventType: filters.eventType,
    status: filters.status,
    startDateFrom: filters.startDateFrom,
    startDateTo: filters.startDateTo,
    endDateFrom: filters.endDateFrom,
    endDateTo: filters.endDateTo,
  };
}

function getQueryKey(filters: Filters): string {
  return JSON.stringify(getServerQuery(filters));
}

function toSearchBlob(item: TimeEvent): string {
  return [item.name, item.description, item.eventType, item.status, item.id]
    .join(" ")
    .toLowerCase();
}

export const useTimeEventsAdminStore = create<TimeEventsAdminState>((set, get) => {
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

  async function fetchSelected(id: number): Promise<TimeEvent | null> {
    set({
      selectedId: id,
      selectedLoading: true,
      selectedParticipant: null,
      selectedParticipantId: null,
    });

    try {
      const event = await TimeEventsService.getById(id);
      if (!event) {
        set({ selected: null });
        return null;
      }

      set((state) => ({
        items: sortEvents(mergeTimeEvent(state.items, event)),
        selected: event,
        selectedId: event.id,
      }));

      await get().fetchParticipants(get().participantsLimit);
      return event;
    } catch (error) {
      const message = getApiErrorMessage(error) ?? "Failed to load time event";
      useUiStore.getState().showSnackbar(message, "error");
      set({ selected: null, participants: [] });
      return null;
    } finally {
      set({ selectedLoading: false });
    }
  }

  return {
    items: [],
    selectedId: null,
    selected: null,
    participants: [],
    selectedParticipantId: null,
    selectedParticipant: null,
    participantsLimit: 10,
    loading: false,
    selectedLoading: false,
    participantsLoading: false,
    selectedParticipantLoading: false,
    actionLoading: false,
    filters: {
      search: "",
      eventType: "",
      status: "",
      startDateFrom: "",
      startDateTo: "",
      endDateFrom: "",
      endDateTo: "",
    },
    lastFetchKey: "",

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
          eventType: "",
          status: "",
          startDateFrom: "",
          startDateTo: "",
          endDateFrom: "",
          endDateTo: "",
        },
      }),

    setParticipantsLimit: (limit) => set({ participantsLimit: Math.max(1, limit) }),

    getFilteredItems: () => {
      const { items, filters } = get();
      const query = filters.search.trim().toLowerCase();
      if (!query) return items;
      return items.filter((item) => toSearchBlob(item).includes(query));
    },

    fetchAll: async (force = false) => {
      if (get().loading) return;
      const key = getQueryKey(get().filters);
      if (!force && get().items.length > 0 && get().lastFetchKey === key) return;

      set({ loading: true });
      try {
        const items = await TimeEventsService.getAll(getServerQuery(get().filters));
        set((state) => ({
          items: sortEvents(items),
          lastFetchKey: key,
          selected:
            state.selectedId === null
              ? state.selected
              : items.find((item) => item.id === state.selectedId) ?? state.selected,
        }));
      } catch (error) {
        const message = getApiErrorMessage(error) ?? "Failed to load time events";
        useUiStore.getState().showSnackbar(message, "error");
      } finally {
        set({ loading: false });
      }
    },

    selectById: async (id) => {
      if (!id) return null;
      return fetchSelected(id);
    },

    clearSelected: () =>
      set({
        selectedId: null,
        selected: null,
        selectedLoading: false,
        participants: [],
        selectedParticipantId: null,
        selectedParticipant: null,
      }),

    fetchParticipants: async (limit) => {
      const selectedId = get().selectedId;
      const resolvedLimit = Math.max(1, limit ?? get().participantsLimit);
      if (!selectedId) {
        set({
          participants: [],
          participantsLimit: resolvedLimit,
          selectedParticipant: null,
          selectedParticipantId: null,
        });
        return [];
      }

      set({
        participantsLoading: true,
        participantsLimit: resolvedLimit,
      });

      try {
        const participants = sortParticipants(
          await TimeEventsService.getEventParticipants(selectedId, resolvedLimit),
        );
        set((state) => ({
          participants,
          selectedParticipant:
            state.selectedParticipantId === null
              ? state.selectedParticipant
              : participants.find(
                  (item) => item.id === state.selectedParticipantId,
                ) ?? state.selectedParticipant,
        }));
        return participants;
      } catch (error) {
        const message =
          getApiErrorMessage(error) ?? "Failed to load event participants";
        useUiStore.getState().showSnackbar(message, "error");
        set({ participants: [] });
        return [];
      } finally {
        set({ participantsLoading: false });
      }
    },

    selectParticipantById: async (id) => {
      if (!id) return null;

      set({
        selectedParticipantId: id,
        selectedParticipantLoading: true,
      });

      try {
        const participant = await TimeEventsService.getParticipantById(id);
        if (!participant) {
          set({ selectedParticipant: null });
          return null;
        }

        set({ selectedParticipant: participant });
        return participant;
      } catch (error) {
        const message =
          getApiErrorMessage(error) ?? "Failed to load participant details";
        useUiStore.getState().showSnackbar(message, "error");
        set({ selectedParticipant: null });
        return null;
      } finally {
        set({ selectedParticipantLoading: false });
      }
    },

    clearSelectedParticipant: () =>
      set({
        selectedParticipant: null,
        selectedParticipantId: null,
        selectedParticipantLoading: false,
      }),

    create: async (payload) => {
      const result = await withAction(async () => {
        const created = await TimeEventsService.create(payload);
        if (!created) throw new Error("Failed to create time event");

        set((state) => ({
          items: sortEvents(mergeTimeEvent(state.items, created)),
          selectedId: created.id,
          selected: created,
        }));

        await get().fetchParticipants(get().participantsLimit);
        return true;
      }, "Failed to create time event");

      return Boolean(result);
    },

    update: async (payload) => {
      const result = await withAction(async () => {
        const updated = await TimeEventsService.update(payload);
        if (!updated) throw new Error("Failed to update time event");

        set((state) => ({
          items: sortEvents(mergeTimeEvent(state.items, updated)),
          selectedId: updated.id,
          selected: updated,
        }));

        await get().fetchParticipants(get().participantsLimit);
        return true;
      }, "Failed to update time event");

      return Boolean(result);
    },

    finish: async (id) => {
      const result = await withAction(async () => {
        await TimeEventsService.finish(id);
        await get().fetchAll(true);
        await fetchSelected(id);
        return true;
      }, "Failed to finish time event");

      return Boolean(result);
    },

    delete: async (id) => {
      const result = await withAction(async () => {
        await TimeEventsService.delete(id);
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
          selectedId: state.selectedId === id ? null : state.selectedId,
          selected: state.selectedId === id ? null : state.selected,
          participants: state.selectedId === id ? [] : state.participants,
          selectedParticipantId:
            state.selectedId === id ? null : state.selectedParticipantId,
          selectedParticipant:
            state.selectedId === id ? null : state.selectedParticipant,
        }));
        return true;
      }, "Failed to delete time event");

      return Boolean(result);
    },

    createParticipant: async (payload) => {
      const result = await withAction(async () => {
        const participant = await TimeEventsService.createParticipant(payload);
        await get().fetchParticipants(get().participantsLimit);
        if (participant) {
          set({
            selectedParticipantId: participant.id,
            selectedParticipant: participant,
          });
        }
        return true;
      }, "Failed to create participant");

      return Boolean(result);
    },

    updateParticipant: async (payload) => {
      const result = await withAction(async () => {
        const participant = await TimeEventsService.updateParticipant(payload);
        await get().fetchParticipants(get().participantsLimit);
        if (participant) {
          set({
            selectedParticipantId: participant.id,
            selectedParticipant: participant,
          });
        }
        return true;
      }, "Failed to update participant");

      return Boolean(result);
    },

    deleteParticipant: async (id) => {
      const result = await withAction(async () => {
        await TimeEventsService.deleteParticipant(id);
        set((state) => ({
          participants: state.participants.filter((item) => item.id !== id),
          selectedParticipantId:
            state.selectedParticipantId === id ? null : state.selectedParticipantId,
          selectedParticipant:
            state.selectedParticipantId === id ? null : state.selectedParticipant,
        }));
        await get().fetchParticipants(get().participantsLimit);
        return true;
      }, "Failed to delete participant");

      return Boolean(result);
    },
  };
});
