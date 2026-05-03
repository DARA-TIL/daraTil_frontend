export type AssistantLanguage = "KZ" | "RU" | "EN";

export interface AssistantWordRequest {
  block: string;
  lang: AssistantLanguage;
  word: string;
}

export interface ExplainWordResponse {
  result: string;
}

export interface TranslateWordResponse {
  context: string;
  result: string;
}

export type AssistantActionKind = "explain" | "translate";

export interface AssistantResponseState {
  kind: AssistantActionKind;
  text: string;
  context?: string;
  targetLanguage?: AssistantLanguage;
}
