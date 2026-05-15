import type {
  DictionaryEntry,
  DictionaryLanguage,
  DictionaryTranslationsMap,
} from "./types";

function mapDictionaryLanguageAlias(value: string): DictionaryLanguage | null {
  const normalized = String(value || "").trim().toUpperCase();

  if (
    normalized === "KZ" ||
    normalized === "KK" ||
    normalized === "KAZ" ||
    normalized === "KAZAKH" ||
    normalized === "?ÀÇ" ||
    normalized === "?ÀÇÀ?"
  ) {
    return "KZ";
  }

  if (
    normalized === "RU" ||
    normalized === "RUS" ||
    normalized === "RUSSIAN" ||
    normalized === "ÐÓ" ||
    normalized === "ÐÓÑÑÊÈÉ"
  ) {
    return "RU";
  }

  if (
    normalized === "EN" ||
    normalized === "ENG" ||
    normalized === "ENGLISH" ||
    normalized === "ÀÍÃË" ||
    normalized === "ÀÍÃËÈÉÑÊÈÉ"
  ) {
    return "EN";
  }

  if (normalized.includes("KZ") || normalized.includes("KK")) return "KZ";
  if (normalized.includes("RU")) return "RU";
  if (normalized.includes("EN")) return "EN";

  return null;
}

export function normalizeDictionaryLanguage(value: string): DictionaryLanguage {
  return mapDictionaryLanguageAlias(value) ?? "EN";
}

export function resolveDictionaryLanguageKey(value: string): string {
  const alias = mapDictionaryLanguageAlias(value);
  if (alias) return alias;

  return String(value || "").trim();
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
      .map(([key, value]) => [resolveDictionaryLanguageKey(key), String(value || "").trim()] as const)
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
