import type {
  AIChatMessageResponse,
  AIChatResponse,
  AIChatUiMessage,
  AiChatSocketStatus,
} from "./types";

export function sortMessages(
  messages: AIChatUiMessage[],
): AIChatUiMessage[] {
  return [...messages].sort((left, right) => {
    const timeDelta =
      new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();

    if (timeDelta !== 0) return timeDelta;
    return left.id - right.id;
  });
}

export function getChatActivityTimestamp(chat: AIChatResponse): number {
  if (chat.lastMessage?.createdAt) {
    const lastMessageTime = new Date(chat.lastMessage.createdAt).getTime();
    if (!Number.isNaN(lastMessageTime)) return lastMessageTime;
  }

  const updatedTime = new Date(chat.updatedAt).getTime();
  if (!Number.isNaN(updatedTime)) return updatedTime;

  const createdTime = new Date(chat.createdAt).getTime();
  return Number.isNaN(createdTime) ? 0 : createdTime;
}

export function sortChats(chats: AIChatResponse[]): AIChatResponse[] {
  return [...chats].sort(
    (left, right) => getChatActivityTimestamp(right) - getChatActivityTimestamp(left),
  );
}

export function mergeChat(
  current: AIChatResponse | undefined,
  incoming: AIChatResponse,
): AIChatResponse {
  return {
    ...current,
    ...incoming,
    messages: incoming.messages ?? current?.messages,
    lastMessage:
      incoming.lastMessage !== undefined
        ? incoming.lastMessage
        : current?.lastMessage,
  };
}

export function buildChatPreview(
  chat: AIChatResponse,
  fallback: string,
): string {
  return chat.lastMessage?.message?.trim() || fallback;
}

export function formatMessageTime(
  value: string,
  locale: string,
): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatChatDate(
  value: string,
  locale: string,
): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function createOptimisticMessage(
  id: number,
  chatId: number,
  message: string,
  userId?: number,
): AIChatUiMessage {
  return {
    id,
    chatId,
    message,
    senderType: "user",
    userId,
    createdAt: new Date().toISOString(),
    pending: true,
    failed: false,
  };
}

export function createAssistantPlaceholder(chatId: number): AIChatMessageResponse {
  return {
    id: 0,
    chatId,
    message: "",
    senderType: "assistant",
    createdAt: new Date().toISOString(),
  };
}

export function isSocketReady(status: AiChatSocketStatus): boolean {
  return status === "connected";
}
