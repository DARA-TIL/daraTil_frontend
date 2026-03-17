export type RegionLanguage = "KZ" | "EN" | "RU" | (string & {});

export interface RegionTranslation {
  description: string;
  id: number;
  language: RegionLanguage;
  name: string;
  regionId: number;
}

export interface RegionSlangTranslation {
  description: string;
  id: number;
  language: RegionLanguage;
  pronounceUrl: string;
  regionSlangId: number;
  word: string;
}

export interface RegionSlang {
  id: number;
  regionId: number;
  translations: RegionSlangTranslation[];
}

export interface RegionTraditionTranslation {
  description: string;
  id: number;
  language: RegionLanguage;
  name: string;
  regionTraditionsId: number;
}

export interface RegionTradition {
  id: number;
  regionId: number;
  translations: RegionTraditionTranslation[];
}

export interface Region {
  code: string;
  id: number;
  imageUrl: string | null;
  isActive: boolean;
  kind: string;
  regionSlang: RegionSlang[];
  regionStatus: string;
  regionTraditions: RegionTradition[];
  requiredLevel: number;
  translations: RegionTranslation[];
}

export type RegionUpdateDto = Region;

export type RegionSlangCreateDto = RegionSlang;
export type RegionSlangUpdateDto = RegionSlang;

export type RegionSlangTranslationCreateDto = RegionSlangTranslation;
export type RegionSlangTranslationUpdateDto = RegionSlangTranslation;

export type RegionTraditionCreateDto = RegionTradition;
export type RegionTraditionUpdateDto = RegionTradition;

export type RegionTraditionTranslationCreateDto = RegionTraditionTranslation;
export type RegionTraditionTranslationUpdateDto = RegionTraditionTranslation;

export type RegionTranslationCreateDto = RegionTranslation;
export type RegionTranslationUpdateDto = RegionTranslation;

export interface GetRegionSlangResponse {
  data: RegionSlang;
  streak?: string;
}

export interface GetRegionTraditionResponse {
  data: RegionTradition;
  streak?: string;
}
