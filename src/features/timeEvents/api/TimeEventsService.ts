import $api from "@/shared/api/http";
import type {
  TimeEvent,
  TimeEventCreateDto,
  TimeEventParticipant,
  TimeEventQuery,
  TimeEventUpdateDto,
} from "../model/types";
import {
  unwrapTimeEventListPayload,
  unwrapTimeEventParticipantListPayload,
  unwrapTimeEventParticipantPayload,
  unwrapTimeEventPayload,
} from "../model/normalize";
import { toApiDateTime } from "../model/presentation";

function cleanQuery(filters: TimeEventQuery): Record<string, string> {
  return Object.fromEntries(
    Object.entries(filters)
      .filter(([, value]) => typeof value === "string" && value.trim().length > 0)
      .map(([key, value]) => {
        if (key.endsWith("DateFrom") || key.endsWith("DateTo")) {
          return [key, toApiDateTime(value)];
        }
        return [key, value];
      })
      .filter(([, value]) => typeof value === "string" && value.trim().length > 0),
  ) as Record<string, string>;
}

function toCreatePayload(payload: TimeEventCreateDto) {
  return {
    description: payload.description.trim(),
    duration: Math.max(1, Math.round(payload.duration)),
    endDate: payload.endDate,
    eventType: payload.eventType,
    name: payload.name.trim(),
    rewardFirst: Math.max(0, Math.round(payload.rewardFirst)),
    rewardSecond: Math.max(0, Math.round(payload.rewardSecond)),
    rewardThird: Math.max(0, Math.round(payload.rewardThird)),
    startDate: payload.startDate,
    status: payload.status,
  };
}

function toUpdatePayload(payload: TimeEventUpdateDto) {
  const base = {
    id: payload.id,
    description: payload.description.trim(),
    duration: Math.max(1, Math.round(payload.duration)),
    endDate: payload.endDate,
    eventType: payload.eventType,
    name: payload.name.trim(),
    rewardFirst: Math.max(0, Math.round(payload.rewardFirst)),
    rewardSecond: Math.max(0, Math.round(payload.rewardSecond)),
    rewardThird: Math.max(0, Math.round(payload.rewardThird)),
    startDate: payload.startDate,
  };

  return {
    ...base,
    ...(payload.status === "ended" ? {} : { status: payload.status }),
  };
}

const TimeEventsService = {
  async getAll(filters: TimeEventQuery = {}): Promise<TimeEvent[]> {
    const response = await $api.get("/timeEvent/", {
      params: cleanQuery(filters),
    });
    return unwrapTimeEventListPayload(response.data);
  },

  async getById(id: number): Promise<TimeEvent | null> {
    const response = await $api.get(`/timeEvent/${id}`);
    return unwrapTimeEventPayload(response.data);
  },

  async create(payload: TimeEventCreateDto): Promise<TimeEvent | null> {
    const response = await $api.post("/timeEvent/", toCreatePayload(payload));
    return unwrapTimeEventPayload(response.data);
  },

  async update(payload: TimeEventUpdateDto): Promise<TimeEvent | null> {
    const response = await $api.patch("/timeEvent/", toUpdatePayload(payload));
    return unwrapTimeEventPayload(response.data);
  },

  async finish(id: number): Promise<void> {
    await $api.post(`/timeEvent/finish/${id}`);
  },

  async delete(id: number): Promise<void> {
    await $api.delete(`/timeEvent/${id}`);
  },

  async getEventParticipants(
    id: number,
    limit: number,
  ): Promise<TimeEventParticipant[]> {
    const response = await $api.get(`/timeEventParticipant/event/${id}/${limit}`);
    return unwrapTimeEventParticipantListPayload(response.data);
  },

  async getParticipantById(id: number): Promise<TimeEventParticipant | null> {
    const response = await $api.get(`/timeEventParticipant/${id}`);
    return unwrapTimeEventParticipantPayload(response.data);
  },
};

export default TimeEventsService;
