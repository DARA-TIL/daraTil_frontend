import type {
  Lesson,
  LessonBlock,
  LessonBestResult,
  LessonResult,
} from "./types";
import { isRecord, unwrapApiData } from "@/shared/lib/unknownRecord";

export function normalizeLessonBlock(raw: unknown): LessonBlock {
  const source = isRecord(raw) ? raw : {};
  return {
    id: Number(source.id ?? source.ID ?? 0),
    lessonID: Number(
      source.lessonId ?? source.LessonID ?? source.lessonID ?? source.LessonId ?? 0,
    ),
    name: String(source.name ?? source.Name ?? ""),
    type: String(
      source.contentType ?? source.ContentType ?? source.type ?? source.Type ?? "text",
    ),
    contentUrl:
      typeof source.contentUrl === "string"
        ? source.contentUrl
        : typeof source.ContentUrl === "string"
          ? source.ContentUrl
          : null,
    contentText:
      typeof source.contentText === "string"
        ? source.contentText
        : typeof source.ContentText === "string"
          ? source.ContentText
          : null,
    position: Number(source.position ?? source.Position ?? 0),
  };
}

function normalizeResult(raw: unknown): LessonResult {
  const source = isRecord(raw) ? raw : {};
  return {
    id: Number(source.id ?? source.ID ?? 0),
    userId: Number(source.userId ?? source.UserID ?? 0),
    testId: Number(source.testId ?? source.TestID ?? 0),
    lessonId: Number(source.lessonId ?? source.LessonID ?? 0),
    result: Number(source.result ?? source.Result ?? 0),
    pass: Boolean(source.pass ?? source.Pass ?? false),
    passTime:
      typeof source.passTime === "string"
        ? source.passTime
        : typeof source.PassTime === "string"
          ? source.PassTime
          : undefined,
  };
}

function normalizeBestResult(raw: unknown): LessonBestResult | null {
  if (!isRecord(raw)) return null;
  return {
    result: Number(raw.result ?? raw.Result ?? 0),
    pass: Boolean(raw.pass ?? raw.Pass ?? false),
  };
}

export function normalizeLesson(raw: unknown): Lesson {
  const source = isRecord(raw) ? raw : {};
  const blocksRaw = source.blocks ?? source.Blocks ?? [];
  const resultsRaw = source.results ?? source.Results ?? [];

  const blocks = Array.isArray(blocksRaw)
    ? blocksRaw.map(normalizeLessonBlock)
    : [];
  const results = Array.isArray(resultsRaw)
    ? resultsRaw.map(normalizeResult)
    : [];

  const best = normalizeBestResult(source.bestResult ?? source.BestResult);

  return {
    ID: Number(source.id ?? source.ID ?? 0),
    name: String(source.name ?? source.Name ?? ""),

    description: String(source.description ?? source.Description ?? ""),
    imageUrl:
      typeof source.imageUrl === "string"
        ? source.imageUrl
        : typeof source.ImageUrl === "string"
          ? source.ImageUrl
          : null,
    author: String(source.author ?? source.Author ?? ""),

    reward: Number(source.reward ?? source.Reward ?? 0),
    requiredLevel: Number(source.requiredLevel ?? source.RequiredLevel ?? 0),

    lessonStatus: String(source.lessonStatus ?? source.LessonStatus ?? ""),

    blocks: blocks
      .filter((b) => b.id > 0)
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),

    results: results.filter((r) => r.id > 0),
    bestResult: best,
  };
}

export function unwrapLessonPayload(payload: unknown): unknown {
  return unwrapApiData(payload);
}

export function unwrapLessonListPayload(payload: unknown): unknown[] {
  const p = unwrapApiData(payload);
  return Array.isArray(p) ? p : [];
}
