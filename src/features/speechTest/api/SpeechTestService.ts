import $api from "@/shared/api/http";
import type {
  CheckPronounceResponse,
  SpeechTest,
  SpeechTestCreateDto,
  SpeechTestListResponse,
  SpeechTestSession,
  SpeechTestSessionResultResponse,
  SpeechTestUpdateDto,
} from "../model/types";
import {
  buildSpeechTestBody,
  unwrapCheckPronouncePayload,
  unwrapSpeechSessionResultPayload,
  unwrapSpeechTestListPayload,
  unwrapSpeechTestPayload,
  unwrapSpeechTestSessionPayload,
} from "../model/normalize";

const SpeechTestService = {
  async getAll(): Promise<SpeechTestListResponse> {
    const response = await $api.get<unknown>("/speech-tests");
    return unwrapSpeechTestListPayload(response.data);
  },

  async getById(id: number): Promise<SpeechTest> {
    const response = await $api.get<unknown>(`/speech-tests/${id}`);
    const test = unwrapSpeechTestPayload(response.data);
    if (!test) throw new Error("Speech test response is invalid");
    return test;
  },

  async create(payload: SpeechTestCreateDto): Promise<SpeechTest> {
    const response = await $api.post<unknown>(
      "/speech-tests",
      buildSpeechTestBody(payload),
    );
    const test = unwrapSpeechTestPayload(response.data);
    if (!test) throw new Error("Create speech test response is invalid");
    return test;
  },

  async update(
    id: number,
    payload: SpeechTestUpdateDto,
  ): Promise<SpeechTest> {
    const response = await $api.put<unknown>(
      `/speech-tests/${id}`,
      buildSpeechTestBody(payload),
    );
    const test = unwrapSpeechTestPayload(response.data);
    if (!test) throw new Error("Update speech test response is invalid");
    return test;
  },

  async delete(id: number): Promise<void> {
    await $api.delete(`/speech-tests/${id}`);
  },
};

export const SpeechTestSessionService = {
  async startSession(): Promise<SpeechTestSession> {
    const response = await $api.post<unknown>("/speech-test-session/start");
    const session = unwrapSpeechTestSessionPayload(response.data);
    if (!session) throw new Error("Speech session response is invalid");
    return session;
  },

  async getNextTest(): Promise<SpeechTest> {
    const response = await $api.get<unknown>("/speech-test-session/next");
    const test = unwrapSpeechTestPayload(response.data);
    if (!test) throw new Error("Next speech test response is invalid");
    return test;
  },

  async checkPronounce(
    testId: number,
    audioFile: File | Blob,
  ): Promise<CheckPronounceResponse> {
    const formData = new FormData();
    formData.append("test_id", String(testId));
    formData.append(
      "audio",
      audioFile,
      audioFile instanceof File ? audioFile.name : `speech-test-${testId}.webm`,
    );

    const response = await $api.post<unknown>(
      "/speech-test-session/check",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    const result = unwrapCheckPronouncePayload(response.data);
    if (!result) throw new Error("Speech check response is invalid");
    return result;
  },

  async endSession(): Promise<SpeechTestSessionResultResponse> {
    const response = await $api.post<unknown>("/speech-test-session/end");
    const result = unwrapSpeechSessionResultPayload(response.data);
    if (!result) throw new Error("Speech session result response is invalid");
    return result;
  },
};

export default SpeechTestService;
