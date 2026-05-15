import {
  getString,
  isRecord,
  unwrapApiData,
} from "@/shared/lib/unknownRecord";
import type {
  AIChatMessageResponse,
  AIChatResponse,
  AIChatShortResponse,
  AiChatErrorPayload,
  AiChatEvent,
  AiChatStatusPayload,
  SendMessageResponse,
  SenderType,
} from "./types";

function toNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function toSenderType(value: unknown): SenderType {
  return value === "assistant" ? "assistant" : "user";
}

function toDateString(value: unknown): string {
  return typeof value === "string" ? value : new Date(0).toISOString();
}

export function normalizeAiChatMessage(
  payload: unknown,
): AIChatMessageResponse | null {
  if (!isRecord(payload)) return null;

  return {
    id: toNumber(payload.id),
    chatId: toNumber(payload.chatId),
    message: getString(payload, "message") ?? "",
    senderType: toSenderType(payload.senderType),
    userId:
      payload.userId === undefined || payload.userId === null
        ? undefined
        : toNumber(payload.userId),
    createdAt: toDateString(payload.createdAt),
  };
}

export function normalizeAiChatMessageList(
  payload: unknown,
): AIChatMessageResponse[] {
  const data = unwrapApiData(payload);
  if (!Array.isArray(data)) return [];

  return data
    .map(normalizeAiChatMessage)
    .filter((item): item is AIChatMessageResponse => item !== null)
    .sort(
      (left, right) =>
        new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
    );
}

export function normalizeAiChatShort(
  payload: unknown,
): AIChatShortResponse | null {
  if (!isRecord(payload)) return null;

  return {
    id: toNumber(payload.id),
    name: getString(payload, "name") ?? "",
    userId: toNumber(payload.userId),
  };
}

export function normalizeAiChat(
  payload: unknown,
): AIChatResponse | null {
  if (!isRecord(payload)) return null;

  const messages = Array.isArray(payload.messages)
    ? payload.messages
        .map(normalizeAiChatMessage)
        .filter((item): item is AIChatMessageResponse => item !== null)
    : undefined;

  const explicitLastMessage = normalizeAiChatMessage(payload.lastMessage);
  const fallbackLastMessage =
    explicitLastMessage ?? (messages?.length ? messages[messages.length - 1] : null);

  return {
    id: toNumber(payload.id),
    name: getString(payload, "name") ?? "",
    userId: toNumber(payload.userId),
    messages,
    lastMessage: fallbackLastMessage,
    createdAt: toDateString(payload.createdAt),
    updatedAt: toDateString(payload.updatedAt),
  };
}

export function normalizeAiChatList(payload: unknown): AIChatResponse[] {
  const data = unwrapApiData(payload);
  if (!Array.isArray(data)) return [];

  return data
    .map(normalizeAiChat)
    .filter((item): item is AIChatResponse => item !== null);
}

export function normalizeSendMessageResponse(
  payload: unknown,
): SendMessageResponse | null {
  if (!isRecord(payload)) return null;

  const chat = normalizeAiChatShort(payload.chat);
  const userMessage = normalizeAiChatMessage(payload.userMessage);
  const aiMessage = normalizeAiChatMessage(payload.aiMessage);

  if (!chat || !userMessage || !aiMessage) return null;

  return {
    chat,
    userMessage,
    aiMessage,
  };
}

export function normalizeAiChatStatusPayload(
  payload: unknown,
): AiChatStatusPayload | null {
  if (!isRecord(payload)) return null;

  return {
    chatId: toNumber(payload.chatId),
  };
}

export function normalizeAiChatErrorPayload(
  payload: unknown,
): AiChatErrorPayload | null {
  if (!isRecord(payload)) return null;

  return {
    message: getString(payload, "message") ?? "Unknown AI chat error",
  };
}

export function normalizeAiChatEvent(payload: unknown): AiChatEvent | null {
  if (!isRecord(payload)) return null;

  const type = getString(payload, "type");
  if (!type) return null;

  return {
    type: type as AiChatEvent["type"],
    payload: payload.payload,
  };
}
