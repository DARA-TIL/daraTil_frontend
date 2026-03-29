export const ACTION_OPTIONS = [
  "lesson_completed",
  "folklore_liked",
  "folklore_disliked",
  "folklore_readed",
  "level_upgraded",
  "region_slang_readed",
  "region_tradition_readed",
] as const;

export type AchievementAction = (typeof ACTION_OPTIONS)[number] | (string & {});
