import $api from "@/shared/api/http";
import {
  normalizeAiChat,
  normalizeAiChatList,
  normalizeAiChatMessageList,
} from "../model/normalize";
import type {
  AIChatMessageResponse,
  AIChatResponse,
  CreateAIChatPayload,
  UpdateAIChatPayload,
} from "../model/types";

const AIChatService = {
  async getAll(): Promise<AIChatResponse[]> {
    const response = await $api.get<unknown>("/ai-chat");
    return normalizeAiChatList(response.data);
  },

  async create(payload: CreateAIChatPayload): Promise<AIChatResponse | null> {
    const response = await $api.post<unknown>("/ai-chat", payload);
    return normalizeAiChat(response.data);
  },

  async getById(id: number): Promise<AIChatResponse | null> {
    const response = await $api.get<unknown>(`/ai-chat/${id}`);
    return normalizeAiChat(response.data);
  },

  async update(payload: UpdateAIChatPayload): Promise<AIChatResponse | null> {
    const response = await $api.patch<unknown>(
      `/ai-chat/${payload.id}`,
      payload,
    );
    return normalizeAiChat(response.data);
  },

  async delete(id: number): Promise<boolean> {
    const response = await $api.delete(`/ai-chat/${id}`);
    return response.status === 204 || response.status === 200;
  },

  async getMessages(id: number): Promise<AIChatMessageResponse[]> {
    const response = await $api.get<unknown>(`/ai-chat/${id}/messages`);
    return normalizeAiChatMessageList(response.data);
  },
};

export default AIChatService;
