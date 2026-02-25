import type {
  Lesson,
  LessonBlock,
  LessonBestResult,
  LessonResult,
} from "./types";

export function normalizeLessonBlock(raw: any): LessonBlock {
  return {
    id: Number(raw?.id ?? raw?.ID ?? 0),
    lessonID: Number(
      raw?.lessonId ?? raw?.LessonID ?? raw?.lessonID ?? raw?.LessonId ?? 0,
    ),
    name: String(raw?.name ?? raw?.Name ?? ""),
    type: String(
      raw?.contentType ?? raw?.ContentType ?? raw?.type ?? raw?.Type ?? "text",
    ),
    contentUrl: raw?.contentUrl ?? raw?.ContentUrl ?? null,
    contentText: raw?.contentText ?? raw?.ContentText ?? null,
    position: Number(raw?.position ?? raw?.Position ?? 0),
  };
}

function normalizeResult(raw: any): LessonResult {
  return {
    id: Number(raw?.id ?? raw?.ID ?? 0),
    userId: Number(raw?.userId ?? raw?.UserID ?? 0),
    testId: Number(raw?.testId ?? raw?.TestID ?? 0),
    lessonId: Number(raw?.lessonId ?? raw?.LessonID ?? 0),
    result: Number(raw?.result ?? raw?.Result ?? 0),
    pass: Boolean(raw?.pass ?? raw?.Pass ?? false),
    passTime: raw?.passTime ?? raw?.PassTime,
  };
}

function normalizeBestResult(raw: any): LessonBestResult | null {
  if (!raw || typeof raw !== "object") return null;
  return {
    result: Number(raw?.result ?? raw?.Result ?? 0),
    pass: Boolean(raw?.pass ?? raw?.Pass ?? false),
  };
}

export function normalizeLesson(raw: any): Lesson {
  const blocksRaw = raw?.blocks ?? raw?.Blocks ?? [];
  const resultsRaw = raw?.results ?? raw?.Results ?? [];

  const blocks = Array.isArray(blocksRaw)
    ? blocksRaw.map(normalizeLessonBlock)
    : [];
  const results = Array.isArray(resultsRaw)
    ? resultsRaw.map(normalizeResult)
    : [];

  const best = normalizeBestResult(raw?.bestResult ?? raw?.BestResult);

  return {
    ID: Number(raw?.id ?? raw?.ID ?? 0),
    name: String(raw?.name ?? raw?.Name ?? ""),

    description: raw?.description ?? raw?.Description ?? "",
    imageUrl: raw?.imageUrl ?? raw?.ImageUrl ?? null,
    author: raw?.author ?? raw?.Author ?? "",

    reward: Number(raw?.reward ?? raw?.Reward ?? 0),
    requiredLevel: Number(raw?.requiredLevel ?? raw?.RequiredLevel ?? 0),

    lessonStatus: String(raw?.lessonStatus ?? raw?.LessonStatus ?? ""),

    blocks: blocks
      .filter((b) => b.id > 0)
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),

    results: results.filter((r) => r.id > 0),
    bestResult: best,
  };
}

export function unwrapLessonPayload(payload: any): any {
  return payload?.data ?? payload;
}

export function unwrapLessonListPayload(payload: any): any[] {
  const p = payload?.data ?? payload;
  return Array.isArray(p) ? p : [];
}
