import type { TFunction } from "i18next";
import type { SpeechDifficulty, SpeechTest } from "./types";

export const SPEECH_DIFFICULTY_OPTIONS: SpeechDifficulty[] = [
  "easy",
  "medium",
  "hard",
];

export function getSpeechDifficultyLabel(
  difficulty: SpeechDifficulty,
  t: TFunction,
): string {
  return t(`difficulty.${difficulty}`, {
    ns: "pronunciation",
    defaultValue: difficulty,
  });
}

export function getSpeechDifficultyColor(
  difficulty: SpeechDifficulty,
): "success" | "warning" | "error" {
  if (difficulty === "easy") return "success";
  if (difficulty === "medium") return "warning";
  return "error";
}

export function getSpeechTextForLanguage(
  test: SpeechTest | null | undefined,
  language: string,
): string {
  if (!test) return "";

  const normalized = language.toLowerCase();
  if (normalized.startsWith("ru")) return test.ru_text;
  if (normalized.startsWith("en")) return test.en_text;
  return test.kz_text;
}

export function getSpeechSessionAccuracy(
  correctCount: number,
  totalCount: number,
): number {
  if (totalCount <= 0) return 0;
  return Math.round((correctCount / totalCount) * 100);
}

export function formatRecordingDuration(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}
