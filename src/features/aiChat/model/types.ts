export type AiChatEventType =
  | "ai_chat_send_message"
  | "ai_chat_user_message_saved"
  | "ai_chat_assistant_typing"
  | "ai_chat_assistant_typing_ended"
  | "ai_chat_error";

export type SenderType = "user" | "assistant";

export type AiChatSocketStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "error";

export interface AIChatMessageResponse {
  id: number;
  chatId: number;
  message: string;
  senderType: SenderType;
  userId?: number;
  createdAt: string;
}

export interface AIChatUiMessage extends AIChatMessageResponse {
  pending?: boolean;
  failed?: boolean;
}

export interface AIChatResponse {
  id: number;
  name: string;
  userId: number;
  messages?: AIChatMessageResponse[];
  lastMessage?: AIChatMessageResponse | null;
  createdAt: string;
  updatedAt: string;
}

export interface AIChatShortResponse {
  id: number;
  name: string;
  userId: number;
}

export interface SendMessageResponse {
  chat: AIChatShortResponse;
  userMessage: AIChatMessageResponse;
  aiMessage: AIChatMessageResponse;
}

export interface AiChatStatusPayload {
  chatId: number;
}

export interface AiChatErrorPayload {
  message: string;
}

export interface AiChatEvent<TPayload = unknown> {
  type: AiChatEventType;
  payload?: TPayload;
}

export interface CreateAIChatPayload {
  name: string;
}

export interface UpdateAIChatPayload {
  id: number;
  name: string;
}

export interface SendAiChatMessageRequest {
  chatId?: number;
  message: string;
}

export interface AIChatSocketHandlers {
  onEvent: (event: AiChatEvent) => void;
  onStatusChange?: (status: AiChatSocketStatus) => void;
  onError?: (message: string) => void;
}
