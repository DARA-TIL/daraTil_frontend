export type TestDto = {
  id: number;
  lessonId: number;
  questions: QuestionDto[];
};

export type QuestionDto = {
  id: number;
  testId: number;
  text: string;
  options: QuestionOptionDto[];
};

export type QuestionOptionDto = {
  id: number;
  questionId: number;
  text: string;
  isCorrect: boolean;
};

export type Test = TestDto;
export type Question = QuestionDto;
export type QuestionOption = QuestionOptionDto;

export type CreateTestDto = {
  lessonId: number;
  questions: Array<{
    text: string;
    options: Array<{ text: string; isCorrect: boolean }>;
  }>;
};

export type UpdateTestDto = {
  id: number;
  questionsUpd: Array<{
    id: number;
    text?: string;
    questionOptionsUpd?: Array<{
      id: number;
      text?: string;
      isCorrect?: boolean;
    }>;
  }>;
};

export type CreateQuestionDto = {
  testId: number;
  text: string;
  options: Array<{ text: string; isCorrect: boolean }>;
};

export type CreateOptionDto = {
  questionId: number;
  text: string;
  isCorrect: boolean;
};
