import type { AssistantLanguage } from "@/features/assistant/model/types";

export type DictionaryLanguage = AssistantLanguage;
export type DictionaryTranslationsMap = Record<string, string>;

export const DICTIONARY_LANGUAGES: DictionaryLanguage[] = ["KZ", "RU", "EN"];

export interface DictionaryEntry {
  context: string;
  id: number;
  originalWord: string;
  wordExplainingTranslations: DictionaryTranslationsMap;
  wordTranslations: DictionaryTranslationsMap;
}

export interface DictionaryCreateDto {
  context: string;
  originalWord: string;
  wordExplainingTranslations: DictionaryTranslationsMap;
  wordTranslations: DictionaryTranslationsMap;
}

export interface DictionaryUpdateDto extends DictionaryCreateDto {
  id: number;
}

export interface DictionaryFavoriteWordRequest {
  block: string;
  lang: DictionaryLanguage;
  word: string;
}
