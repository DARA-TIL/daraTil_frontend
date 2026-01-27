import type {
  Folklore,
  FolkloreLang,
  FolkloreTabLang,
  FolkloreTranslation,
} from "./types";

export function getTranslationByLang(
  folklore: Folklore | null | undefined,
  lang: FolkloreLang
): FolkloreTranslation | undefined {
  if (!folklore?.translations?.length) return undefined;
  return folklore.translations.find((t) => t.language === lang);
}

export function normalizeTabLang(i18nLang: string): FolkloreTabLang {
  const l = (i18nLang || "").toLowerCase();

  if (l === "kk") return "kz"; // если вдруг придет kk
  if (l === "kz" || l === "ru" || l === "en") return l;

  return "original";
}

// (опционально) если хочешь оставить normalizeLang для поиска translation:
export function normalizeLang(i18nLang: string): FolkloreLang {
  const l = (i18nLang || "").toLowerCase();
  if (l === "kk") return "kz";
  return (l || "kz") as FolkloreLang;
}
