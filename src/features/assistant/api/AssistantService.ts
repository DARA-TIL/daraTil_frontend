import $api from "@/shared/api/http";
import { isRecord, unwrapApiData } from "@/shared/lib/unknownRecord";
import type {
  AssistantWordRequest,
  ExplainWordResponse,
  TranslateWordResponse,
} from "../model/types";

function parseExplainResponse(payload: unknown): ExplainWordResponse {
  const data = unwrapApiData(payload);

  if (!isRecord(data) || typeof data.result !== "string") {
    throw new Error("Assistant returned invalid explain response.");
  }

  const result = data.result.trim();
  if (!result) {
    throw new Error("Assistant returned empty explain result.");
  }

  return { result };
}

function parseTranslateResponse(payload: unknown): TranslateWordResponse {
  const data = unwrapApiData(payload);

  if (!isRecord(data) || typeof data.result !== "string") {
    throw new Error("Assistant returned invalid translate response.");
  }

  const result = data.result.trim();
  if (!result) {
    throw new Error("Assistant returned empty translate result.");
  }

  return {
    result,
    context: typeof data.context === "string" ? data.context.trim() : "",
  };
}

const AssistantService = {
  async explainWord(payload: AssistantWordRequest): Promise<ExplainWordResponse> {
    const response = await $api.post<unknown>("/assistant/explainWord", payload);
    return parseExplainResponse(response.data);
  },

  async translateWord(
    payload: AssistantWordRequest,
  ): Promise<TranslateWordResponse> {
    const response = await $api.post<unknown>("/assistant/translate", payload);
    return parseTranslateResponse(response.data);
  },
};

export default AssistantService;
