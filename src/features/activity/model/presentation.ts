import type { ActivityAction } from "./types";

type TranslateFn = (
  key: string,
  options?: Record<string, unknown>,
) => string;

function normalizeEntityType(entityType: string): string {
  return entityType
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getActivityColor(action: ActivityAction): string {
  switch (action) {
    case "lesson_completed":
      return "#3b82f6";
    case "folklore_liked":
      return "#16a34a";
    case "folklore_disliked":
      return "#ef4444";
    case "folklore_read":
      return "#a855f7";
    default:
      return "#64748b";
  }
}

export function getActivityTitle(action: ActivityAction, t: TranslateFn): string {
  switch (action) {
    case "lesson_completed":
      return t("cards.activityActionLessonCompleted", {
        defaultValue: "Lesson completed",
      });
    case "folklore_liked":
      return t("cards.activityActionFolkloreLiked", {
        defaultValue: "Folklore liked",
      });
    case "folklore_disliked":
      return t("cards.activityActionFolkloreDisliked", {
        defaultValue: "Folklore disliked",
      });
    case "folklore_read":
      return t("cards.activityActionFolkloreRead", {
        defaultValue: "Folklore read",
      });
    default:
      return t("cards.activityActionUnknown", {
        defaultValue: "Activity updated",
      });
  }
}

export function getActivityEntityLabel(
  entityType: string,
  entityID: number,
  t: TranslateFn,
): string {
  const normalizedType = normalizeEntityType(entityType);
  const fallback = t("cards.activityEntityFallback", { defaultValue: "Entity" });

  if (!normalizedType && entityID <= 0) return fallback;
  if (!normalizedType) return `${fallback} #${entityID}`;
  if (entityID <= 0) return normalizedType;

  return `${normalizedType} #${entityID}`;
}

export function formatRelativeActivityTime(
  value: string,
  locale: string,
  t: TranslateFn,
): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return t("cards.activityTimeUnknown", { defaultValue: "Unknown time" });
  }

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);
  const weeks = Math.round(days / 7);
  const months = Math.round(days / 30);
  const years = Math.round(days / 365);

  if (Math.abs(seconds) < 60) return rtf.format(seconds, "second");
  if (Math.abs(minutes) < 60) return rtf.format(minutes, "minute");
  if (Math.abs(hours) < 24) return rtf.format(hours, "hour");
  if (Math.abs(days) < 7) return rtf.format(days, "day");
  if (Math.abs(weeks) < 5) return rtf.format(weeks, "week");
  if (Math.abs(months) < 12) return rtf.format(months, "month");
  return rtf.format(years, "year");
}

export function formatActivityDateTime(
  value: string,
  locale: string,
  t: TranslateFn,
): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return t("cards.activityTimeUnknown", { defaultValue: "Unknown time" });
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
