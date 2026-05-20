import {
  isRecord,
  unwrapApiData,
  type UnknownRecord,
} from "@/shared/lib/unknownRecord";
import type {
  CheckPronounceResponse,
  SpeechDifficulty,
  SpeechTest,
  SpeechTestCreateDto,
  SpeechTestListResponse,
  SpeechTestSession,
  SpeechTestSessionResultResponse,
} from "./types";

const DIFFICULTIES: SpeechDifficulty[] = ["easy", "medium", "hard"];

function asString(value: unknown): string {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return "";
  return String(value);
}

function asNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function asBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1";
  }
  return false;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function normalizeSpeechDifficulty(value: unknown): SpeechDifficulty {
  const difficulty = asString(value).trim().toLowerCase();
  return DIFFICULTIES.includes(difficulty as SpeechDifficulty)
    ? (difficulty as SpeechDifficulty)
    : "easy";
}

export function normalizeSpeechTest(dto: unknown): SpeechTest | null {
  if (!isRecord(dto)) return null;

  return {
    id: asNumber(dto.id ?? dto.ID),
    kz_text: asString(dto.kz_text ?? dto.kzText ?? dto.KzText ?? dto.KZText),
    ru_text: asString(dto.ru_text ?? dto.ruText ?? dto.RuText ?? dto.RUText),
    en_text: asString(dto.en_text ?? dto.enText ?? dto.EnText ?? dto.ENText),
    difficulty: normalizeSpeechDifficulty(dto.difficulty ?? dto.Difficulty),
  };
}

export function normalizeSpeechTestSession(
  dto: unknown,
): SpeechTestSession | null {
  if (!isRecord(dto)) return null;

  return {
    id: asNumber(dto.id ?? dto.ID),
    user_id: asNumber(dto.user_id ?? dto.userId ?? dto.UserID),
    speech_tests: asArray(
      dto.speech_tests ?? dto.speechTests ?? dto.SpeechTests,
    )
      .map(normalizeSpeechTest)
      .filter((item): item is SpeechTest => Boolean(item)),
    correct_count: asNumber(
      dto.correct_count ?? dto.correctCount ?? dto.CorrectCount,
    ),
    is_ended: asBoolean(dto.is_ended ?? dto.isEnded ?? dto.IsEnded),
  };
}

export function unwrapSpeechTestPayload(payload: unknown): SpeechTest | null {
  const value = unwrapApiData(payload);
  if (isRecord(value) && (value.id !== undefined || value.ID !== undefined)) {
    return normalizeSpeechTest(value);
  }
  if (isRecord(value) && isRecord(value.speechTest)) {
    return normalizeSpeechTest(value.speechTest);
  }
  return null;
}

export function unwrapSpeechTestListPayload(
  payload: unknown,
): SpeechTestListResponse {
  const value = unwrapApiData(payload);

  if (Array.isArray(value)) {
    const items = value
      .map(normalizeSpeechTest)
      .filter((item): item is SpeechTest => Boolean(item));
    return { items, total: items.length };
  }

  if (!isRecord(value)) return { items: [], total: 0 };

  const rawItems = asArray(value.items ?? value.Items);
  const items = rawItems
    .map(normalizeSpeechTest)
    .filter((item): item is SpeechTest => Boolean(item));

  return {
    items,
    total: Math.max(items.length, asNumber(value.total ?? value.Total)),
  };
}

export function unwrapSpeechTestSessionPayload(
  payload: unknown,
): SpeechTestSession | null {
  const value = unwrapApiData(payload);
  if (isRecord(value) && (value.id !== undefined || value.ID !== undefined)) {
    return normalizeSpeechTestSession(value);
  }
  if (isRecord(value) && isRecord(value.session)) {
    return normalizeSpeechTestSession(value.session);
  }
  return null;
}

export function unwrapCheckPronouncePayload(
  payload: unknown,
): CheckPronounceResponse | null {
  const value = unwrapApiData(payload);
  if (!isRecord(value)) return null;

  const test = normalizeSpeechTest(value.test ?? value.Test);
  if (!test) return null;

  return {
    test,
    ai_response: asString(
      value.ai_response ?? value.aiResponse ?? value.AIResponse,
    ),
    is_correct: asBoolean(value.is_correct ?? value.isCorrect ?? value.IsCorrect),
  };
}

export function unwrapSpeechSessionResultPayload(
  payload: unknown,
): SpeechTestSessionResultResponse | null {
  const value = unwrapApiData(payload);
  if (!isRecord(value)) return null;

  const session = normalizeSpeechTestSession(value.session ?? value.Session);
  if (!session) return null;

  return {
    session,
    reward: asNumber(value.reward ?? value.Reward),
  };
}

export function buildSpeechTestBody(
  payload: SpeechTestCreateDto,
): SpeechTestCreateDto {
  return {
    kz_text: payload.kz_text.trim(),
    ru_text: payload.ru_text.trim(),
    en_text: payload.en_text.trim(),
    difficulty: normalizeSpeechDifficulty(payload.difficulty),
  };
}

export function isSpeechTestDraftValid(payload: SpeechTestCreateDto): boolean {
  return (
    payload.kz_text.trim().length > 0 &&
    payload.ru_text.trim().length > 0 &&
    payload.en_text.trim().length > 0 &&
    DIFFICULTIES.includes(payload.difficulty)
  );
}

export function getSpeechTestSearchBlob(item: SpeechTest): string {
  return [
    item.id,
    item.kz_text,
    item.ru_text,
    item.en_text,
    item.difficulty,
  ]
    .join(" ")
    .toLowerCase();
}

export function mergeSpeechTest(
  items: SpeechTest[],
  item: SpeechTest,
): SpeechTest[] {
  const exists = items.some((current) => current.id === item.id);
  const next = exists
    ? items.map((current) => (current.id === item.id ? item : current))
    : [item, ...items];
  return next.sort((left, right) => right.id - left.id);
}

export function normalizeSpeechTestRecord(
  value: UnknownRecord,
): SpeechTest | null {
  return normalizeSpeechTest(value);
}
