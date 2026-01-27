export type FolkloreLang = "kz" | "ru" | "en" | (string & {});

export interface FolkloreTranslation {
  id: number;
  folkloreID: number;
  language: FolkloreLang;
  name: string;
  content: string;
  explanation: string;
  createdAt: string;
  updatedAt: string;
}

export interface Folklore {
  id: number;
  type: string; // proverb | story | song | etc
  author: string;
  region: string;
  content: string;
  name: string;
  mediaUrl: string | null;
  imageUrl: string | null;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
  translations?: FolkloreTranslation[];
}

export type FolkloreCreateDto = Pick<
  Folklore,
  "type" | "author" | "region" | "name" | "content" | "mediaUrl" | "imageUrl"
>;

export type FolkloreTabLang = "original" | "kz" | "ru" | "en";

export type FolkloreUpdateDto = Partial<FolkloreCreateDto>;
