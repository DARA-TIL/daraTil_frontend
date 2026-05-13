import type { TFunction } from "i18next";
import type { TimeEvent, TimeEventAction, TimeEventStatus } from "./types";

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function getTimeEventActionLabel(
  action: TimeEventAction,
  t: TFunction,
): string {
  const defaults: Record<string, string> = {
    lesson_completed: "Lesson completed",
    folklore_liked: "Folklore liked",
    folklore_disliked: "Folklore disliked",
    folklore_readed: "Folklore read",
    level_upgraded: "Level upgraded",
    region_slang_readed: "Region slang read",
    region_tradition_readed: "Region tradition read",
    word_learned: "Word learned",
  };

  return t(`actions.${action}`, {
    ns: "achievements",
    defaultValue: defaults[action] ?? action,
  });
}

export function getTimeEventStatusLabel(
  status: TimeEventStatus,
  t: TFunction,
): string {
  const defaults: Record<string, string> = {
    started: "Started",
    ended: "Ended",
    waiting: "Waiting",
    canceled: "Canceled",
  };

  return t(`timeEvents.status.${status}`, {
    ns: "admin",
    defaultValue: defaults[status] ?? status,
  });
}

export function getTimeEventStatusTone(
  status: TimeEventStatus,
): "success" | "default" | "warning" | "error" {
  switch (status) {
    case "started":
      return "success";
    case "waiting":
      return "warning";
    case "canceled":
      return "error";
    default:
      return "default";
  }
}

export function formatTimeEventDateTime(
  value: string,
  locale: string,
): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatTimeEventInputValue(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function toApiDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString();
}

export function addHoursToDate(value: string, hours: number): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  date.setHours(date.getHours() + Math.max(0, hours));
  return date.toISOString();
}

export function getDurationLabel(hours: number, t: TFunction): string {
  const count = Math.max(0, Math.round(hours));
  return t("timeEvents.labels.durationHours", {
    ns: "admin",
    count,
    defaultValue: count === 1 ? "{{count}} hour" : "{{count}} hours",
  });
}

export function getRewardTotal(first: number, second: number, third: number): number {
  return Math.max(0, first) + Math.max(0, second) + Math.max(0, third);
}

function safeTimestamp(value: string, fallback: number): number {
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : fallback;
}

export function sortTimeEventsByPriority(items: TimeEvent[]): TimeEvent[] {
  return [...items].sort((left, right) => {
    const weight = (status: TimeEventStatus): number => {
      switch (status) {
        case "started":
          return 0;
        case "waiting":
          return 1;
        case "ended":
          return 2;
        case "canceled":
          return 3;
        default:
          return 4;
      }
    };

    const statusDiff = weight(left.status) - weight(right.status);
    if (statusDiff !== 0) return statusDiff;

    if (left.status === "started") {
      return safeTimestamp(left.endDate, Number.MAX_SAFE_INTEGER) -
        safeTimestamp(right.endDate, Number.MAX_SAFE_INTEGER);
    }

    if (left.status === "waiting") {
      return safeTimestamp(left.startDate, Number.MAX_SAFE_INTEGER) -
        safeTimestamp(right.startDate, Number.MAX_SAFE_INTEGER);
    }

    return safeTimestamp(right.endDate, 0) - safeTimestamp(left.endDate, 0);
  });
}

export function getFeaturedTimeEvent(items: TimeEvent[]): TimeEvent | null {
  const [first] = sortTimeEventsByPriority(items);
  return first ?? null;
}
