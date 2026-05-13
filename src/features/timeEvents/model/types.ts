import type { IUser } from "@/features/auth/model/IUser";

export const TIME_EVENT_ACTION_OPTIONS = [
  "lesson_completed",
  "folklore_liked",
  "folklore_disliked",
  "folklore_readed",
  "level_upgraded",
  "region_slang_readed",
  "region_tradition_readed",
  "word_learned",
] as const;

export const TIME_EVENT_STATUS_OPTIONS = [
  "started",
  "ended",
  "waiting",
  "canceled",
] as const;

export const EDITABLE_TIME_EVENT_STATUS_OPTIONS = [
  "started",
  "waiting",
  "canceled",
] as const;

export type TimeEventAction =
  | (typeof TIME_EVENT_ACTION_OPTIONS)[number]
  | (string & {});

export type TimeEventStatus =
  | (typeof TIME_EVENT_STATUS_OPTIONS)[number]
  | (string & {});

export interface TimeEventParticipant {
  count: number;
  id: number;
  isActive: boolean;
  place: number;
  timeEventId: number;
  user: IUser | null;
  userId: number;
}

export interface TimeEvent {
  description: string;
  duration: number;
  endDate: string;
  eventType: TimeEventAction;
  id: number;
  name: string;
  participants: TimeEventParticipant[];
  rewardFirst: number;
  rewardSecond: number;
  rewardThird: number;
  startDate: string;
  status: TimeEventStatus;
}

export interface TimeEventQuery {
  eventType?: TimeEventAction | "";
  status?: TimeEventStatus | "";
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
}

export interface TimeEventCreateDto {
  description: string;
  duration: number;
  endDate: string;
  eventType: TimeEventAction;
  name: string;
  rewardFirst: number;
  rewardSecond: number;
  rewardThird: number;
  startDate: string;
  status: Exclude<TimeEventStatus, "ended">;
}

export interface TimeEventUpdateDto {
  description: string;
  duration: number;
  endDate: string;
  eventType: TimeEventAction;
  id: number;
  name: string;
  rewardFirst: number;
  rewardSecond: number;
  rewardThird: number;
  startDate: string;
  status: TimeEventStatus;
}
