import $api from "@/shared/api/http";
import type { ActivityItem } from "../model/types";

type ActivityDto = Partial<{
  action: string;
  Action: string;
  entityID: number | string;
  EntityID: number | string;
  entityType: string;
  EntityType: string;
  id: number | string;
  ID: number | string;
  time: string;
  Time: string;
  userID: number | string;
  UserID: number | string;
}>;

function toNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function normalizeActivity(dto: ActivityDto): ActivityItem {
  const rawAction = String(dto.action ?? dto.Action ?? "").trim().toLowerCase();
  const normalizedAction =
    rawAction === "folklore_readed" ? "folklore_read" : rawAction;

  return {
    action: normalizedAction,
    entityID: toNumber(dto.entityID ?? dto.EntityID),
    entityType: String(dto.entityType ?? dto.EntityType ?? ""),
    id: toNumber(dto.id ?? dto.ID),
    time: String(dto.time ?? dto.Time ?? ""),
    userID: toNumber(dto.userID ?? dto.UserID),
  };
}

function unwrapList(payload: unknown): ActivityDto[] {
  if (Array.isArray(payload)) return payload as ActivityDto[];

  if (payload && typeof payload === "object") {
    const record = payload as { data?: unknown };
    if (Array.isArray(record.data)) return record.data as ActivityDto[];
  }

  return [];
}

function toUnixTime(value: string): number {
  const ts = new Date(value).getTime();
  return Number.isNaN(ts) ? 0 : ts;
}

const ActivityService = {
  async getRecent(): Promise<ActivityItem[]> {
    const res = await $api.get<unknown>("/activity/");
    const list = unwrapList(res.data).map(normalizeActivity);
    return list.sort((a, b) => toUnixTime(b.time) - toUnixTime(a.time));
  },
};

export default ActivityService;
