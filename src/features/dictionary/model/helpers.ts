import type {
  DictionaryEntry,
  DictionaryLanguage,
  DictionaryTranslationsMap,
} from "./types";

export function normalizeDictionaryLanguage(value: string): DictionaryLanguage {
  const normalized = String(value || "").trim().toUpperCase();

  if (normalized === "KK") return "KZ";
  if (normalized === "KZ" || normalized === "RU" || normalized === "EN") {
    return normalized;
  }

  return "EN";
}

function getLanguageFallbacks(language: DictionaryLanguage): DictionaryLanguage[] {
  const normalized = normalizeDictionaryLanguage(language);
  return [normalized, "KZ", "RU", "EN"];
}

export function compactDictionaryMap(
  source: DictionaryTranslationsMap,
): DictionaryTranslationsMap {
  return Object.fromEntries(
    Object.entries(source)
      .map(([key, value]) => [normalizeDictionaryLanguage(key), String(value || "").trim()] as const)
      .filter(([, value]) => Boolean(value)),
  );
}

export function pickDictionaryValue(
  source: DictionaryTranslationsMap,
  language: DictionaryLanguage,
): string {
  const fallbacks = getLanguageFallbacks(language);

  for (const key of fallbacks) {
    const candidate = String(source[key] ?? "").trim();
    if (candidate) return candidate;
  }

  const first = Object.values(source).find((value) => String(value || "").trim());
  return first ? String(first).trim() : "";
}

export function countFilledDictionaryValues(source: DictionaryTranslationsMap): number {
  return Object.values(source).filter((value) => String(value || "").trim()).length;
}

export function hasDictionaryContent(entry: DictionaryEntry): boolean {
  return Boolean(
    entry.context.trim() ||
      countFilledDictionaryValues(entry.wordTranslations) ||
      countFilledDictionaryValues(entry.wordExplainingTranslations),
  );
}

export function getDictionaryCompletion(entry: DictionaryEntry): {
  translations: number;
  explanations: number;
} {
  return {
    translations: countFilledDictionaryValues(entry.wordTranslations),
    explanations: countFilledDictionaryValues(entry.wordExplainingTranslations),
  };
}
