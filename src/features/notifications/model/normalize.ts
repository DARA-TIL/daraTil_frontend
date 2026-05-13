import { isRecord, unwrapApiData } from "@/shared/lib/unknownRecord";
import type {
  AppNotification,
  NotificationScope,
  NotificationsResponse,
  NotificationType,
} from "./types";

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asBoolean(value: unknown): boolean {
  return value === true || value === "true" || value === 1 || value === "1";
}

function asNullableNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function normalizeScope(value: unknown): NotificationScope {
  return String(value ?? "").trim().toLowerCase() === "global" ? "global" : "user";
}

function normalizeType(value: unknown): NotificationType {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_\s-]+/g, "");

  if (normalized === "event") return "event";
  if (normalized === "streak") return "streak";
  if (normalized === "reward") return "reward";
  if (normalized === "logout") return "logOut";
  return "system";
}

export function parseNotification(source: unknown): AppNotification | null {
  const payload = unwrapApiData(source);
  if (!isRecord(payload)) return null;

  const id = asNullableNumber(payload.id ?? payload.ID);
  if (!id) return null;

  return {
    createdAt: asString(payload.createdAt),
    entityId: asNullableNumber(payload.entityId ?? payload.entityID),
    id,
    isActive: asBoolean(payload.isActive),
    isRead: asBoolean(payload.isRead),
    message: asString(payload.message),
    readAt: asString(payload.readAt),
    scope: normalizeScope(payload.scope),
    title: asString(payload.title),
    type: normalizeType(payload.type),
    userId: asNullableNumber(payload.userId ?? payload.userID),
  };
}

function parseNotificationsArray(source: unknown): AppNotification[] {
  if (!Array.isArray(source)) return [];

  return source
    .map((item) => parseNotification(item))
    .filter((item): item is AppNotification => Boolean(item))
    .sort((left, right) => {
      const leftTime = Date.parse(left.createdAt || "") || 0;
      const rightTime = Date.parse(right.createdAt || "") || 0;
      return rightTime - leftTime || right.id - left.id;
    });
}

export function parseNotificationsResponse(source: unknown): NotificationsResponse {
  const payload = unwrapApiData(source);

  if (Array.isArray(payload)) {
    const items = parseNotificationsArray(payload);
    return {
      items,
      unread: items.filter((item) => !item.isRead).length,
    };
  }

  if (!isRecord(payload)) {
    return { items: [], unread: 0 };
  }

  const items = parseNotificationsArray(
    Array.isArray(payload.notifications)
      ? payload.notifications
      : Array.isArray(payload.items)
        ? payload.items
        : [],
  );

  const unread =
    typeof payload.unread === "number" && Number.isFinite(payload.unread)
      ? payload.unread
      : items.filter((item) => !item.isRead).length;

  return { items, unread };
}

export function markNotificationRead(
  notification: AppNotification,
  readAt = new Date().toISOString(),
): AppNotification {
  return {
    ...notification,
    isRead: true,
    readAt: notification.readAt || readAt,
  };
}

export function markNotificationsRead(
  notifications: AppNotification[],
  readAt = new Date().toISOString(),
): AppNotification[] {
  return notifications.map((item) =>
    item.isRead ? item : markNotificationRead(item, readAt),
  );
}
