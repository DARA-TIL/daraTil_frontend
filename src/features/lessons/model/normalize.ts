import type { Lesson, LessonBlock } from "./types";

/**
 * Backend (Go/GORM) часто отдаёт поля как ID / CreatedAt и т.д.
 * Тут приводим всё к фронтовому формату.
 */

export function normalizeLessonBlock(raw: any): LessonBlock {
  return {
    id: Number(raw?.id ?? raw?.ID ?? 0),
    lessonID: Number(raw?.lessonID ?? raw?.LessonID ?? raw?.lessonId ?? 0),
    name: String(raw?.name ?? ""),
    type: String(raw?.type ?? raw?.ContentType ?? "text"),
    contentUrl: raw?.contentUrl ?? raw?.ContentUrl ?? null,
    contentText: raw?.contentText ?? raw?.ContentText ?? null,
    position: Number(raw?.position ?? raw?.Position ?? 0),
  };
}

export function normalizeLesson(raw: any): Lesson {
  const blocksRaw = raw?.blocks ?? raw?.Blocks ?? [];
  const blocks = Array.isArray(blocksRaw)
    ? blocksRaw.map(normalizeLessonBlock)
    : [];

  return {
    ID: Number(raw?.id ?? raw?.ID ?? 0),
    name: String(raw?.name ?? ""),
    description: String(raw?.description ?? ""),
    imageUrl: raw?.imageUrl ?? raw?.ImageUrl ?? null,
    author: String(raw?.author ?? ""),
    reward: Number(raw?.reward ?? 0),
    requiredLevel: Number(raw?.requiredLevel ?? 0),
    blocks: blocks
      .filter((b) => b.id > 0) // важнее всего id, иначе навигация ломается
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
  };
}

/**
 * API returns either:
 * - Lesson
 * - { data: Lesson }
 */
export function unwrapLessonPayload(payload: any): any {
  return payload?.data ?? payload;
}

/**
 * API returns either:
 * - Lesson[]
 * - { data: Lesson[] }
 */
export function unwrapLessonListPayload(payload: any): any[] {
  const p = payload?.data ?? payload;
  return Array.isArray(p) ? p : [];
}
