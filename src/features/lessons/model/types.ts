export type LessonBlockType =
  | "text"
  | "image"
  | "audio"
  | "video"
  | "youtube"
  | string;

export interface LessonBlock {
  id: number;
  lessonID: number;
  name: string;
  type: LessonBlockType;
  contentUrl?: string | null;
  contentText?: string | null;
  position: number;
}

export interface Lesson {
  ID: number;
  name: string;
  description: string;
  imageUrl?: string | null;
  author: string;
  reward: number;
  requiredLevel: number;
  blocks?: LessonBlock[];
}

// DTOs
export type LessonCreateDto = {
  name: string;
  description: string;
  imageUrl?: string | null;
  author: string;
  reward: number;
  requiredLevel: number;
  blocks?: LessonBlock[];
};

export type LessonUpdateDto = Partial<
  Pick<
    Lesson,
    "name" | "description" | "imageUrl" | "author" | "reward" | "requiredLevel"
  >
>;

export type LessonBlockCreateDto = {
  lessonID: number;
  name: string;
  type: LessonBlockType;
  contentUrl?: string | null;
  contentText?: string | null;
  position: number;
};

export type LessonBlockUpdateDto = Partial<
  Pick<
    LessonBlock,
    "lessonID" | "name" | "type" | "contentUrl" | "contentText" | "position"
  >
>;
