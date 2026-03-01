export type LessonStatus = "locked" | "available" | "passed" | string;

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

export interface LessonResult {
  id: number;
  userId: number;
  testId: number;
  lessonId: number;
  result: number; // 0-100
  pass: boolean;

  // бэк сейчас отдаёт "PassTime" (с большой буквы), поэтому оставим оба варианта как optional
  PassTime?: string;
  passTime?: string;
}

export type LessonBestResult = {
  result: number;
  pass: boolean;
};

export interface Lesson {
  ID: number;
  name: string;

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

export interface FinishLessonProgress {
  // новый прогресс из бэка
  isImproved?: boolean;
  isLvlUp?: boolean;
  prevBestResult?: number;

  // опционально, если бэк добавит позже
  xpGained?: number;
  prevLevel?: number;
  currentLevel?: number;
  prevXp?: number;
  currentXp?: number;
  xpForNextLevel?: number;
  maxXp?: number;
}

export interface FinishLessonResponse {
  // важно: после нормализации LessonsService.finish это именно lessonResult
  data: LessonResult;
  progress?: FinishLessonProgress;
  streak?: string;
}
