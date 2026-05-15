import type {
  DictionaryCreateDto,
  DictionaryEntry,
  DictionaryFavoriteWordRequest,
  DictionaryTranslationsMap,
  DictionaryUpdateDto,
} from "./types";
import {
  compactDictionaryMap,
  normalizeDictionaryLanguage,
  resolveDictionaryLanguageKey,
} from "./helpers";

type RawRecord = Record<string, unknown>;

function isRecord(value: unknown): value is RawRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

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

function unwrap(payload: unknown): unknown {
  if (!isRecord(payload)) return payload;
  return payload.data ?? payload;
}

export function normalizeDictionaryMap(value: unknown): DictionaryTranslationsMap {
  if (!isRecord(value)) return {};

  return compactDictionaryMap(
    Object.fromEntries(
      Object.entries(value).map(([key, itemValue]) => [
        resolveDictionaryLanguageKey(key),
        asString(itemValue),
      ]),
    ),
  );
}

export function normalizeDictionaryEntry(dto: unknown): DictionaryEntry {
  const record = isRecord(dto) ? dto : {};

  return {
    context: asString(record.context ?? record.Context),
    id: asNumber(record.id ?? record.ID),
    originalWord: asString(
      record.originalWord ??
        record.OriginalWord ??
        record.word ??
        record.original_word,
    ),
    wordExplainingTranslations: normalizeDictionaryMap(
      record.wordExplainingTranslations ??
        record.WordExplainingTranslations ??
        record.word_explaining_translations,
    ),
    wordTranslations: normalizeDictionaryMap(
      record.wordTranslations ??
        record.WordTranslations ??
        record.word_translations,
    ),
  };
}

export function unwrapDictionaryListPayload(payload: unknown): DictionaryEntry[] {
  const value = unwrap(payload);
  return Array.isArray(value) ? value.map(normalizeDictionaryEntry) : [];
}

export function unwrapDictionaryPayload(payload: unknown): DictionaryEntry | null {
  const value = unwrap(payload);

  if (!isRecord(value)) return null;
  if (value.id !== undefined || value.ID !== undefined) {
    return normalizeDictionaryEntry(value);
  }

  if (isRecord(value.dictionary)) {
    return normalizeDictionaryEntry(value.dictionary);
  }

  return null;
}

export function buildDictionaryCreateBody(dto: DictionaryCreateDto): DictionaryCreateDto {
  return {
    context: dto.context.trim(),
    originalWord: dto.originalWord.trim(),
    wordExplainingTranslations: compactDictionaryMap(dto.wordExplainingTranslations),
    wordTranslations: compactDictionaryMap(dto.wordTranslations),
  };
}

export function buildDictionaryUpdateBody(dto: DictionaryUpdateDto): DictionaryUpdateDto {
  return {
    ...buildDictionaryCreateBody(dto),
    id: dto.id,
  };
}

export function buildDictionaryFavoriteWordBody(
  dto: DictionaryFavoriteWordRequest,
): DictionaryFavoriteWordRequest {
  return {
    block: dto.block.trim(),
    lang: normalizeDictionaryLanguage(dto.lang),
    word: dto.word.trim(),
  };
}
