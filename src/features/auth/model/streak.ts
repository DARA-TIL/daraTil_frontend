export type StreakStatusKind =
  | "no_change"
  | "incremented"
  | "reset"
  | "created"
  | "new_start"
  | "unknown";

function normalize(raw: unknown): string {
  return String(raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_\s-]+/g, "");
}

export function parseStreakStatus(raw: unknown): StreakStatusKind {
  const value = normalize(raw);

  if (!value) return "unknown";
  if (value === "0" || value === "nochange") return "no_change";
  if (value === "1" || value === "incremented") return "incremented";
  if (value === "2" || value === "reset") return "reset";
  if (value === "3" || value === "created") return "created";
  if (value === "4" || value === "newstart") return "new_start";

  return "unknown";
}

export function toCanonicalStreakStatus(raw: unknown): string {
  const kind = parseStreakStatus(raw);
  switch (kind) {
    case "no_change":
      return "NoChange";
    case "incremented":
      return "Incremented";
    case "reset":
      return "Reset";
    case "created":
      return "Created";
    case "new_start":
      return "NewStart";
    default:
      return String(raw ?? "");
  }
}
