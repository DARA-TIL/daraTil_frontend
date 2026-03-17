import type {
  Region,
  RegionLanguage,
  RegionSlang,
  RegionSlangTranslation,
  RegionTradition,
  RegionTraditionTranslation,
  RegionTranslation,
} from "./types";

export type RegionTab = "overview" | "dialects" | "traditions";

export interface MapRegionProperties {
  source?: string;
  id: string;
  name: string;
  code: string;
  backendName?: string;
  kind?: string;
}

export function normalizeRegionLanguage(i18nLang: string): RegionLanguage {
  const normalized = String(i18nLang || "").trim().toUpperCase();

  if (normalized === "KK") return "KZ";
  if (normalized === "KZ" || normalized === "RU" || normalized === "EN") {
    return normalized;
  }

  return "EN";
}

function getLanguageFallbacks(language: RegionLanguage): RegionLanguage[] {
  const normalized = normalizeRegionLanguage(language);
  return [normalized, "KZ", "RU", "EN"];
}

export function pickRegionTranslation(
  translations: RegionTranslation[] | undefined,
  language: RegionLanguage,
): RegionTranslation | null {
  if (!translations?.length) return null;

  const fallbacks = getLanguageFallbacks(language);
  for (const item of fallbacks) {
    const match = translations.find((translation) => translation.language === item);
    if (match) return match;
  }

  return translations[0] ?? null;
}

export function pickRegionSlangTranslation(
  translations: RegionSlangTranslation[] | undefined,
  language: RegionLanguage,
): RegionSlangTranslation | null {
  if (!translations?.length) return null;

  const fallbacks = getLanguageFallbacks(language);
  for (const item of fallbacks) {
    const match = translations.find((translation) => translation.language === item);
    if (match) return match;
  }

  return translations[0] ?? null;
}

export function pickRegionTraditionTranslation(
  translations: RegionTraditionTranslation[] | undefined,
  language: RegionLanguage,
): RegionTraditionTranslation | null {
  if (!translations?.length) return null;

  const fallbacks = getLanguageFallbacks(language);
  for (const item of fallbacks) {
    const match = translations.find((translation) => translation.language === item);
    if (match) return match;
  }

  return translations[0] ?? null;
}

export function getRegionDisplayName(
  region: Region | null | undefined,
  language: RegionLanguage,
  fallbackName = "",
): string {
  const translation = pickRegionTranslation(region?.translations, language);
  return translation?.name || fallbackName || region?.code || "";
}

export function getRegionDisplayDescription(
  region: Region | null | undefined,
  language: RegionLanguage,
): string {
  const translation = pickRegionTranslation(region?.translations, language);
  return translation?.description || "";
}

export function getRegionSlangCards(
  items: RegionSlang[] | undefined,
  language: RegionLanguage,
): Array<{
  id: number;
  word: string;
  description: string;
  pronounceUrl: string;
}> {
  return (items ?? [])
    .map((item) => {
      const translation = pickRegionSlangTranslation(item.translations, language);
      return {
        id: item.id,
        word: translation?.word || "",
        description: translation?.description || "",
        pronounceUrl: translation?.pronounceUrl || "",
      };
    })
    .filter((item) => item.word || item.description);
}

export function getRegionTraditionCards(
  items: RegionTradition[] | undefined,
  language: RegionLanguage,
): Array<{
  id: number;
  name: string;
  description: string;
}> {
  return (items ?? [])
    .map((item) => {
      const translation = pickRegionTraditionTranslation(
        item.translations,
        language,
      );
      return {
        id: item.id,
        name: translation?.name || "",
        description: translation?.description || "",
      };
    })
    .filter((item) => item.name || item.description);
}

export function getMapRegionName(
  properties: MapRegionProperties,
  region?: Region | null,
  language: RegionLanguage = "EN",
): string {
  return getRegionDisplayName(region, language, properties.name || properties.backendName || "");
}
