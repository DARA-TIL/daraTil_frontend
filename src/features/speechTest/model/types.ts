export type SpeechDifficulty = "easy" | "medium" | "hard";

export type SpeechTest = {
  id: number;
  kz_text: string;
  ru_text: string;
  en_text: string;
  difficulty: SpeechDifficulty;
};

export type SpeechTestCreateDto = Omit<SpeechTest, "id">;

export type SpeechTestUpdateDto = SpeechTestCreateDto;

export type SpeechTestListResponse = {
  items: SpeechTest[];
  total: number;
};

export type SpeechTestSession = {
  id: number;
  user_id: number;
  speech_tests: SpeechTest[];
  correct_count: number;
  is_ended: boolean;
};

export type CheckPronounceResponse = {
  test: SpeechTest;
  ai_response: string;
  is_correct: boolean;
};

export type SpeechTestSessionResultResponse = {
  session: SpeechTestSession;
  reward: number;
};

export type SpeechPracticeStep =
  | "idle"
  | "ready"
  | "recording"
  | "recorded"
  | "checking"
  | "feedback"
  | "finished";
