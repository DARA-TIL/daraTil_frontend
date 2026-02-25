export type LessonStatus = "locked" | "available" | "passed" | string;

export type LessonResult = {
  id: number;
  userId: number;
  testId: number;
  lessonId: number;
  result: number; // 0-100
  pass: boolean;
  passTime?: string; // optional, если бек начнёт отдавать
};

export type LessonBestResult = {
  result: number;
  pass: boolean;
};

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

  // list может приходить без description/blocks
  description?: string;
  imageUrl?: string | null;
  author?: string;

  reward: number;
  requiredLevel: number;

  lessonStatus?: LessonStatus;

  blocks?: LessonBlock[];

  results?: LessonResult[];
  bestResult?: LessonBestResult | null;
}

// DTOs admin
export type LessonCreateDto = {
  name: string;
  description: string;
  imageUrl?: string | null;
  author: string;
  reward: number;
  requiredLevel: number;
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
    "name" | "type" | "contentUrl" | "contentText" | "position" | "lessonID"
  >
>;

// finish lesson
export type FinishLessonRequest = {
  testId: number;
  lessonId: number;
  userAns: Record<string, number>; // questionId -> optionId
};

export type FinishLessonData = {
  result: number;
  pass: boolean;
};

export type FinishLessonProgress = {
  isImproved: boolean;
  isLvlUp: boolean;
  xpGained?: number;
  prevBestResult?: number;
  maxXp?: number;
  prevXp?: number;
  prevLevel?: number;
  currentXp?: number;
  xpForNextLevel?: number;
  currentLevel?: number;
};

export type FinishLessonResponse = {
  data: FinishLessonData;
  progress: FinishLessonProgress | null;
};
