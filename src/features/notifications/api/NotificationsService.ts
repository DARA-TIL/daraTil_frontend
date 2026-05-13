import $api from "@/shared/api/http";
import { parseNotification, parseNotificationsResponse } from "../model/normalize";
import type {
  AppNotification,
  CreateNotificationPayload,
  NotificationQuery,
  NotificationsResponse,
  UpdateNotificationPayload,
} from "../model/types";

function buildQuery(params: NotificationQuery): Record<string, string | number | boolean> {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined),
  ) as Record<string, string | number | boolean>;
}

class NotificationsService {
  async getAll(query: NotificationQuery = {}): Promise<NotificationsResponse> {
    const response = await $api.get("/notifications/", {
      params: buildQuery(query),
    });
    return parseNotificationsResponse(response.data);
  }

  async getById(id: number): Promise<AppNotification | null> {
    const response = await $api.get(`/notifications/${id}`);
    return parseNotification(response.data);
  }

  async create(payload: CreateNotificationPayload): Promise<AppNotification | null> {
    const response = await $api.post("/notifications/", payload);
    return parseNotification(response.data);
  }

  async update(payload: UpdateNotificationPayload): Promise<AppNotification | null> {
    const response = await $api.patch("/notifications/", payload);
    return parseNotification(response.data);
  }

  async deleteMine(id: number): Promise<void> {
    await $api.delete(`/notifications/me/${id}`);
  }

  async deleteMineAll(): Promise<void> {
    await $api.delete("/notifications/me");
  }

  async deleteById(id: number): Promise<void> {
    await $api.delete(`/notifications/${id}`);
  }
}

export default new NotificationsService();
