export type NotificationScope = "user" | "global";

export type NotificationType =
  | "system"
  | "event"
  | "streak"
  | "reward"
  | "logOut";

export interface AppNotification {
  createdAt: string;
  entityId: number | null;
  id: number;
  isActive: boolean;
  isRead: boolean;
  message: string;
  readAt: string;
  scope: NotificationScope;
  title: string;
  type: NotificationType;
  userId: number | null;
}

export interface NotificationsResponse {
  items: AppNotification[];
  unread: number;
}

export interface NotificationQuery {
  type?: NotificationType;
  scope?: NotificationScope;
  notSeen?: boolean;
  limit?: number;
}

export interface CreateNotificationPayload {
  entityId?: number | null;
  message: string;
  scope: NotificationScope;
  title: string;
  type: NotificationType;
  userId?: number | null;
}

export interface UpdateNotificationPayload {
  id: number;
  isActive?: boolean;
  message?: string;
  scope?: NotificationScope;
  title?: string;
  type?: NotificationType;
}
