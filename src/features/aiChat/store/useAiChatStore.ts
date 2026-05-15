import { create } from "zustand";
import { getApiErrorMessage } from "@/shared/lib/getApiErrorMessage";
import { useUiStore } from "@/shared/store/useUiStore";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import AIChatService from "../api/AIChatService";
import { AIChatSocket } from "../api/AIChatSocket";
import {
  normalizeAiChat,
  normalizeAiChatErrorPayload,
  normalizeAiChatShort,
  normalizeAiChatStatusPayload,
  normalizeSendMessageResponse,
} from "../model/normalize";
import {
  createOptimisticMessage,
  mergeChat,
  sortChats,
  sortMessages,
} from "../model/presentation";
import type {
  AIChatResponse,
  AIChatUiMessage,
  AiChatEvent,
  AiChatSocketStatus,
  CreateAIChatPayload,
  SendAiChatMessageRequest,
  UpdateAIChatPayload,
} from "../model/types";

let aiChatSocket: AIChatSocket | null = null;
let optimisticMessageSeed = -1;

type MessagesByChatId = Record<number, AIChatUiMessage[]>;

type AiChatState = {
  chats: AIChatResponse[];
  activeChatId: number | null;
  draftMessages: AIChatUiMessage[];
  messagesByChatId: MessagesByChatId;
  loadedChatIds: number[];
  loadingChats: boolean;
  loadingMessages: boolean;
  mutatingChat: boolean;
  sending: boolean;
  typingChatId: number | null;
  socketStatus: AiChatSocketStatus;
  fetchChats: (options?: { silent?: boolean }) => Promise<AIChatResponse[]>;
  selectChat: (chatId: number, force?: boolean) => Promise<void>;
  startNewChat: () => void;
  createEmptyChat: (payload: CreateAIChatPayload) => Promise<AIChatResponse | null>;
  renameChat: (payload: UpdateAIChatPayload) => Promise<AIChatResponse | null>;
  deleteChat: (chatId: number) => Promise<boolean>;
  sendMessage: (message: string) => Promise<boolean>;
  connectSocket: () => void;
  disconnectSocket: () => void;
  reset: () => void;
};

function upsertChatCollection(
  chats: AIChatResponse[],
  incoming: AIChatResponse,
): AIChatResponse[] {
  const next = [...chats];
  const index = next.findIndex((chat) => chat.id === incoming.id);

  if (index >= 0) {
    next[index] = mergeChat(next[index], incoming);
  } else {
    next.push(incoming);
  }

  return sortChats(next);
}

function setMessagesForChat(
  collection: MessagesByChatId,
  chatId: number,
  messages: AIChatUiMessage[],
): MessagesByChatId {
  return {
    ...collection,
    [chatId]: sortMessages(messages),
  };
}

function upsertMessage(
  collection: MessagesByChatId,
  chatId: number,
  message: AIChatUiMessage,
): MessagesByChatId {
  const current = collection[chatId] ?? [];
  const index = current.findIndex((item) => item.id === message.id);
  const next = [...current];

  if (index >= 0) {
    next[index] = { ...next[index], ...message };
  } else {
    next.push(message);
  }

  return setMessagesForChat(collection, chatId, next);
}

function clearPendingForChat(
  collection: MessagesByChatId,
  chatId: number,
): MessagesByChatId {
  const current = collection[chatId] ?? [];
  if (current.length === 0) return collection;

  return setMessagesForChat(
    collection,
    chatId,
    current.map((item) =>
      item.senderType === "user" && item.pending
        ? { ...item, pending: false, failed: false }
        : item,
    ),
  );
}

function markFailedForChat(
  collection: MessagesByChatId,
  chatId: number,
): MessagesByChatId {
  const current = collection[chatId] ?? [];
  if (current.length === 0) return collection;

  let marked = false;
  const next = [...current].reverse().map((item) => {
    if (!marked && item.senderType === "user" && item.pending) {
      marked = true;
      return {
        ...item,
        pending: false,
        failed: true,
      };
    }

    return item;
  }).reverse();

  return setMessagesForChat(collection, chatId, next);
}

function replaceOptimisticWithRealMessages(
  collection: MessagesByChatId,
  chatId: number,
  userMessage: AIChatUiMessage,
  aiMessage: AIChatUiMessage,
): MessagesByChatId {
  const current = collection[chatId] ?? [];
  const next = current.filter(
    (item) =>
      !(
        item.senderType === "user" &&
        (item.pending || item.id < 0) &&
        item.message.trim() === userMessage.message.trim()
      ),
  );

  const withUser = upsertMessage({ ...collection, [chatId]: next }, chatId, userMessage);
  return upsertMessage(withUser, chatId, aiMessage);
}

function getCurrentUserId(): number {
  return Number(useAuthStore.getState().user?.id ?? 0);
}

function toUiMessage(message: AIChatUiMessage): AIChatUiMessage {
  return {
    ...message,
    pending: Boolean(message.pending),
    failed: Boolean(message.failed),
  };
}

function createSocketHandlers(
  set: (fn: (state: AiChatState) => Partial<AiChatState>) => void,
) {
  return {
    onEvent: (event: AiChatEvent) => {
      handleSocketEvent(event, set);
    },
    onStatusChange: (status: AiChatSocketStatus) => {
      set(() => ({ socketStatus: status }));
    },
    onError: (message: string) => {
      if (import.meta.env.DEV) {
        console.warn("AI chat socket", message);
      }
    },
  };
}

function handleSocketEvent(
  event: AiChatEvent,
  set: (fn: (state: AiChatState) => Partial<AiChatState>) => void,
) {
  if (event.type === "ai_chat_user_message_saved") {
    const normalizedChat =
      normalizeAiChat(event.payload) ??
      (() => {
        const short = normalizeAiChatShort(event.payload);
        if (!short) return null;
        return {
          id: short.id,
          name: short.name,
          userId: short.userId,
          messages: undefined,
          lastMessage: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } satisfies AIChatResponse;
      })();

    if (!normalizedChat) return;

    set((state) => {
      const targetChatId = normalizedChat.id;
      const isDraftFlow =
        state.activeChatId === null && state.draftMessages.length > 0;

      const mergedMessages = isDraftFlow
        ? state.draftMessages.map((message) => ({
            ...message,
            chatId: targetChatId,
            pending: false,
            failed: false,
          }))
        : (state.messagesByChatId[targetChatId] ?? []).map((message) =>
            message.senderType === "user" && message.pending
              ? { ...message, pending: false, failed: false }
              : message,
          );

      const nextChat = mergeChat(
        state.chats.find((chat) => chat.id === targetChatId),
        {
          ...normalizedChat,
          lastMessage:
            mergedMessages.length > 0
              ? mergedMessages[mergedMessages.length - 1]
              : normalizedChat.lastMessage ?? null,
          updatedAt:
            mergedMessages.length > 0
              ? mergedMessages[mergedMessages.length - 1].createdAt
              : normalizedChat.updatedAt,
        },
      );

      return {
        chats: upsertChatCollection(state.chats, nextChat),
        activeChatId: targetChatId,
        draftMessages: [],
        messagesByChatId: setMessagesForChat(
          state.messagesByChatId,
          targetChatId,
          mergedMessages,
        ),
        loadedChatIds: state.loadedChatIds.includes(targetChatId)
          ? state.loadedChatIds
          : [...state.loadedChatIds, targetChatId],
      };
    });

    return;
  }

  if (event.type === "ai_chat_assistant_typing") {
    const payload = normalizeAiChatStatusPayload(event.payload);
    if (!payload) return;

    set((state) => ({
      typingChatId: payload.chatId,
      sending: false,
      messagesByChatId: clearPendingForChat(state.messagesByChatId, payload.chatId),
    }));

    return;
  }

  if (event.type === "ai_chat_send_message") {
    const payload = normalizeSendMessageResponse(event.payload);
    if (!payload) return;

    set((state) => {
      const chatId = payload.chat.id;
      const existingChat = state.chats.find((chat) => chat.id === chatId);
      const userMessage = toUiMessage(payload.userMessage);
      const aiMessage = toUiMessage(payload.aiMessage);

      const nextMessages = replaceOptimisticWithRealMessages(
        state.messagesByChatId,
        chatId,
        userMessage,
        aiMessage,
      );

      const nextChat: AIChatResponse = mergeChat(existingChat, {
        id: payload.chat.id,
        name: payload.chat.name,
        userId: payload.chat.userId,
        messages: undefined,
        lastMessage: aiMessage,
        createdAt: existingChat?.createdAt ?? userMessage.createdAt,
        updatedAt: aiMessage.createdAt,
      });

      return {
        chats: upsertChatCollection(state.chats, nextChat),
        activeChatId: chatId,
        draftMessages: [],
        messagesByChatId: nextMessages,
        typingChatId:
          state.typingChatId === chatId ? null : state.typingChatId,
        sending: false,
        loadedChatIds: state.loadedChatIds.includes(chatId)
          ? state.loadedChatIds
          : [...state.loadedChatIds, chatId],
      };
    });

    return;
  }

  if (event.type === "ai_chat_assistant_typing_ended") {
    const payload = normalizeAiChatStatusPayload(event.payload);
    if (!payload) return;

    set((state) => ({
      typingChatId:
        state.typingChatId === payload.chatId ? null : state.typingChatId,
      sending: false,
    }));
    return;
  }

  if (event.type === "ai_chat_error") {
    const payload = normalizeAiChatErrorPayload(event.payload);
    const message = payload?.message || "AI chat error";

    set((state) => {
      const targetChatId = state.activeChatId;
      return {
        sending: false,
        typingChatId: null,
        draftMessages:
          targetChatId === null
            ? state.draftMessages.map((item) =>
                item.pending ? { ...item, pending: false, failed: true } : item,
              )
            : state.draftMessages,
        messagesByChatId:
          targetChatId !== null
            ? markFailedForChat(state.messagesByChatId, targetChatId)
            : state.messagesByChatId,
      };
    });

    useUiStore.getState().showSnackbar(message, "error");
  }
}

export const useAiChatStore = create<AiChatState>((set, get) => ({
  chats: [],
  activeChatId: null,
  draftMessages: [],
  messagesByChatId: {},
  loadedChatIds: [],
  loadingChats: false,
  loadingMessages: false,
  mutatingChat: false,
  sending: false,
  typingChatId: null,
  socketStatus: "idle" as AiChatSocketStatus,

  fetchChats: async (options = {}) => {
    if (!options.silent) {
      set(() => ({ loadingChats: true }));
    }

    try {
      const chats = sortChats(await AIChatService.getAll());
      set((state) => {
        const activeExists =
          state.activeChatId !== null &&
          chats.some((chat) => chat.id === state.activeChatId);

        return {
          chats,
          activeChatId: activeExists ? state.activeChatId : null,
        };
      });
      return chats;
    } catch (error) {
      useUiStore.getState().showSnackbar(
        getApiErrorMessage(error) ?? "Failed to load AI chats",
        "error",
      );
      return [];
    } finally {
      set(() => ({ loadingChats: false }));
    }
  },

  selectChat: async (chatId, force = false) => {
    set(() => ({ activeChatId: chatId, draftMessages: [] }));

    const state = get();
    const shouldFetch = force || !state.loadedChatIds.includes(chatId);
    if (!shouldFetch) return;

    set(() => ({ loadingMessages: true }));

    try {
      const messages = (await AIChatService.getMessages(chatId)).map((message) =>
        toUiMessage(message),
      );

      set((current) => ({
        messagesByChatId: setMessagesForChat(
          current.messagesByChatId,
          chatId,
          messages,
        ),
        loadedChatIds: current.loadedChatIds.includes(chatId)
          ? current.loadedChatIds
          : [...current.loadedChatIds, chatId],
      }));
    } catch (error) {
      useUiStore.getState().showSnackbar(
        getApiErrorMessage(error) ?? "Failed to load chat messages",
        "error",
      );
    } finally {
      set(() => ({ loadingMessages: false }));
    }
  },

  startNewChat: () => {
    set(() => ({
      activeChatId: null,
      draftMessages: [],
      sending: false,
      typingChatId: null,
    }));
  },

  createEmptyChat: async (payload) => {
    set(() => ({ mutatingChat: true }));

    try {
      const created = await AIChatService.create(payload);
      if (!created) return null;

      set((state) => ({
        chats: upsertChatCollection(state.chats, created),
        activeChatId: created.id,
      }));

      return created;
    } catch (error) {
      useUiStore.getState().showSnackbar(
        getApiErrorMessage(error) ?? "Failed to create chat",
        "error",
      );
      return null;
    } finally {
      set(() => ({ mutatingChat: false }));
    }
  },

  renameChat: async (payload) => {
    set(() => ({ mutatingChat: true }));

    try {
      const updated = await AIChatService.update(payload);
      if (!updated) return null;

      set((state) => ({
        chats: upsertChatCollection(state.chats, updated),
      }));

      return updated;
    } catch (error) {
      useUiStore.getState().showSnackbar(
        getApiErrorMessage(error) ?? "Failed to rename chat",
        "error",
      );
      return null;
    } finally {
      set(() => ({ mutatingChat: false }));
    }
  },

  deleteChat: async (chatId) => {
    set(() => ({ mutatingChat: true }));

    try {
      const ok = await AIChatService.delete(chatId);
      if (!ok) return false;

      set((state) => {
        const nextChats = state.chats.filter((chat) => chat.id !== chatId);
        const nextActiveChatId =
          state.activeChatId === chatId ? nextChats[0]?.id ?? null : state.activeChatId;
        const nextMessages = { ...state.messagesByChatId };
        delete nextMessages[chatId];

        return {
          chats: nextChats,
          activeChatId: nextActiveChatId,
          messagesByChatId: nextMessages,
          loadedChatIds: state.loadedChatIds.filter((id) => id !== chatId),
          typingChatId: state.typingChatId === chatId ? null : state.typingChatId,
        };
      });

      return true;
    } catch (error) {
      useUiStore.getState().showSnackbar(
        getApiErrorMessage(error) ?? "Failed to delete chat",
        "error",
      );
      return false;
    } finally {
      set(() => ({ mutatingChat: false }));
    }
  },

  sendMessage: async (message) => {
    const trimmed = message.trim();
    if (!trimmed) return false;

    const state = get();
    if (state.sending || state.typingChatId !== null) return false;

    const chatId = state.activeChatId ?? 0;
    const optimisticId = optimisticMessageSeed--;
    const optimisticMessage = createOptimisticMessage(
      optimisticId,
      chatId,
      trimmed,
      getCurrentUserId() || undefined,
    );

    if (!aiChatSocket) {
      get().connectSocket();
    }

    const requestPayload: SendAiChatMessageRequest = state.activeChatId
      ? { chatId: state.activeChatId, message: trimmed }
      : { message: trimmed };

    const sent = aiChatSocket?.send(requestPayload) ?? false;
    if (!sent) return false;

    set((current) => {
      if (current.activeChatId === null) {
        return {
          draftMessages: [...current.draftMessages, optimisticMessage],
          sending: true,
        };
      }

      const updatedMessages = upsertMessage(
        current.messagesByChatId,
        current.activeChatId,
        optimisticMessage,
      );

      const existingChat = current.chats.find(
        (chat) => chat.id === current.activeChatId,
      );

      const updatedChat = existingChat
        ? mergeChat(existingChat, {
            ...existingChat,
            lastMessage: optimisticMessage,
            updatedAt: optimisticMessage.createdAt,
          })
        : undefined;

      return {
        messagesByChatId: updatedMessages,
        chats: updatedChat
          ? upsertChatCollection(current.chats, updatedChat)
          : current.chats,
        sending: true,
      };
    });

    return true;
  },

  connectSocket: () => {
    if (aiChatSocket) {
      aiChatSocket.connect();
      return;
    }

    aiChatSocket = new AIChatSocket(createSocketHandlers(set));
    aiChatSocket.connect();
  },

  disconnectSocket: () => {
    aiChatSocket?.disconnect();
    aiChatSocket = null;
  },

  reset: () => {
    aiChatSocket?.disconnect();
    aiChatSocket = null;

    set(() => ({
      chats: [],
      activeChatId: null,
      draftMessages: [],
      messagesByChatId: {},
      loadedChatIds: [],
      loadingChats: false,
      loadingMessages: false,
      mutatingChat: false,
      sending: false,
      typingChatId: null,
      socketStatus: "idle",
    }));
  },
}));
