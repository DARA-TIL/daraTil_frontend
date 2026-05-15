import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  alpha,
  useTheme,
} from "@mui/material/styles";
import {
  Box,
  Button,
  Chip,
  Drawer,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import WifiRoundedIcon from "@mui/icons-material/WifiRounded";
import WifiOffRoundedIcon from "@mui/icons-material/WifiOffRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import { useTranslation } from "react-i18next";
import AIChatSidebar from "@/features/aiChat/ui/AIChatSidebar";
import AIChatMessageBubble from "@/features/aiChat/ui/AIChatMessageBubble";
import AIChatRenameDialog from "@/features/aiChat/ui/AIChatRenameDialog";
import { useAiChatStore } from "@/features/aiChat/store/useAiChatStore";
import {
  formatMessageTime,
  isSocketReady,
} from "@/features/aiChat/model/presentation";
import { requestConfirm } from "@/shared/store/useConfirmDialogStore";
import { useUiStore } from "@/shared/store/useUiStore";
import type { AIChatResponse, AIChatUiMessage } from "@/features/aiChat/model/types";

const AIChatPage: React.FC = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const { t, i18n } = useTranslation("aiChat");
  const showSnackbar = useUiStore((state) => state.showSnackbar);

  const chats = useAiChatStore((state) => state.chats);
  const activeChatId = useAiChatStore((state) => state.activeChatId);
  const draftMessages = useAiChatStore((state) => state.draftMessages);
  const messagesByChatId = useAiChatStore((state) => state.messagesByChatId);
  const loadedChatIds = useAiChatStore((state) => state.loadedChatIds);
  const loadingChats = useAiChatStore((state) => state.loadingChats);
  const loadingMessages = useAiChatStore((state) => state.loadingMessages);
  const mutatingChat = useAiChatStore((state) => state.mutatingChat);
  const sending = useAiChatStore((state) => state.sending);
  const typingChatId = useAiChatStore((state) => state.typingChatId);
  const socketStatus = useAiChatStore((state) => state.socketStatus);
  const fetchChats = useAiChatStore((state) => state.fetchChats);
  const selectChat = useAiChatStore((state) => state.selectChat);
  const startNewChat = useAiChatStore((state) => state.startNewChat);
  const renameChat = useAiChatStore((state) => state.renameChat);
  const deleteChat = useAiChatStore((state) => state.deleteChat);
  const sendMessage = useAiChatStore((state) => state.sendMessage);
  const connectSocket = useAiChatStore((state) => state.connectSocket);
  const disconnectSocket = useAiChatStore((state) => state.disconnectSocket);

  const locale = i18n.resolvedLanguage ?? "en";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [composer, setComposer] = useState("");
  const [renameTarget, setRenameTarget] = useState<AIChatResponse | null>(null);
  const bottomAnchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    connectSocket();

    void fetchChats().then((nextChats) => {
      if (nextChats.length > 0 && !useAiChatStore.getState().activeChatId) {
        void selectChat(nextChats[0].id);
      }
    });

    return () => {
      disconnectSocket();
    };
  }, [connectSocket, disconnectSocket, fetchChats, selectChat]);

  useEffect(() => {
    if (activeChatId && !loadedChatIds.includes(activeChatId)) {
      void selectChat(activeChatId);
    }
  }, [activeChatId, loadedChatIds, selectChat]);

  const activeChat = useMemo(
    () => chats.find((chat) => chat.id === activeChatId) ?? null,
    [activeChatId, chats],
  );

  const activeMessages = useMemo<AIChatUiMessage[]>(
    () => (activeChatId ? messagesByChatId[activeChatId] ?? [] : draftMessages),
    [activeChatId, draftMessages, messagesByChatId],
  );

  const isTypingInActiveChat =
    activeChatId !== null && typingChatId === activeChatId;
  const isBusy = sending || typingChatId !== null;
  const canSend =
    isSocketReady(socketStatus) && composer.trim().length > 0 && !isBusy;

  const suggestions = useMemo(
    () => [
      t("suggestions.one", {
        defaultValue: "Explain Kazakh case endings with simple examples.",
      }),
      t("suggestions.two", {
        defaultValue: "Give me dialect words from western Kazakhstan.",
      }),
      t("suggestions.three", {
        defaultValue: "Help me prepare for my next lesson quiz.",
      }),
    ],
    [t],
  );

  useEffect(() => {
    bottomAnchorRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [activeMessages.length, isTypingInActiveChat]);

  const socketStatusLabel = useMemo(() => {
    switch (socketStatus) {
      case "connected":
        return t("status.connected", { defaultValue: "Connected" });
      case "connecting":
        return t("status.connecting", { defaultValue: "Connecting..." });
      case "reconnecting":
        return t("status.reconnecting", { defaultValue: "Reconnecting..." });
      case "error":
        return t("status.error", { defaultValue: "Connection issue" });
      default:
        return t("status.idle", { defaultValue: "Idle" });
    }
  }, [socketStatus, t]);

  const handleSend = async (text?: string) => {
    const nextValue = (text ?? composer).trim();
    if (!nextValue) return;

    const sent = await sendMessage(nextValue);
    if (!sent) {
      if (!isSocketReady(socketStatus)) {
        showSnackbar(
          t("status.sendUnavailable", {
            defaultValue: "Wait until the AI chat connection is ready.",
          }),
          "warning",
        );
      }
      return;
    }

    setComposer("");
  };

  const handleDeleteChat = async (chat: AIChatResponse) => {
    const confirmed = await requestConfirm({
      title: t("confirm.deleteTitle", {
        defaultValue: "Delete chat?",
      }),
      message: t("confirm.deleteMessage", {
        defaultValue:
          'The chat "{{name}}" and its saved history will be removed.',
        name: chat.name,
      }),
      confirmLabel: t("sidebar.delete", { defaultValue: "Delete" }),
      cancelLabel: t("common.cancel", { defaultValue: "Cancel" }),
      variant: "danger",
    });

    if (!confirmed) return;

    const ok = await deleteChat(chat.id);
    if (!ok) return;

    showSnackbar(
      t("snackbar.deleted", {
        defaultValue: "Chat deleted.",
      }),
      "success",
    );
  };

  const handleRenameSubmit = async (name: string) => {
    if (!renameTarget) return;

    const updated = await renameChat({
      id: renameTarget.id,
      name,
    });

    if (!updated) return;

    setRenameTarget(null);
    showSnackbar(
      t("snackbar.renamed", {
        defaultValue: "Chat renamed.",
      }),
      "success",
    );
  };

  const sidebar = (
    <AIChatSidebar
      activeChatId={activeChatId}
      chats={chats}
      loading={loadingChats}
      query={query}
      onQueryChange={setQuery}
      onNewChat={() => {
        startNewChat();
        setComposer("");
        setSidebarOpen(false);
      }}
      onRefresh={() => {
        void fetchChats();
      }}
      onSelectChat={(chatId) => {
        void selectChat(chatId);
        setSidebarOpen(false);
      }}
      onRenameChat={(chat) => setRenameTarget(chat)}
      onDeleteChat={(chat) => {
        void handleDeleteChat(chat);
      }}
    />
  );

  return (
    <Box sx={{ px: { xs: 1.5, md: 2.5 }, pb: 3 }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "320px minmax(0, 1fr)",
          },
          gap: 2,
          alignItems: "stretch",
          minHeight: "calc(100vh - 120px)",
        }}
      >
        {isDesktop ? <Box sx={{ minWidth: 0 }}>{sidebar}</Box> : null}

        <Paper
          sx={{
            minWidth: 0,
            minHeight: { xs: "calc(100vh - 140px)", lg: "calc(100vh - 120px)" },
            display: "flex",
            flexDirection: "column",
            borderRadius: 4,
            border: "1px solid",
            borderColor: theme.customColors.sidebarBorder,
            overflow: "hidden",
            background:
              theme.palette.mode === "light"
                ? "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,252,0.96))"
                : "linear-gradient(180deg, rgba(15,23,42,0.98), rgba(15,23,42,0.94))",
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={1.5}
            sx={{
              px: { xs: 1.5, md: 2.2 },
              py: 1.4,
              borderBottom: "1px solid",
              borderColor: alpha("#94a3b8", 0.16),
            }}
          >
            <Stack direction="row" spacing={1.2} alignItems="center" minWidth={0}>
              {!isDesktop ? (
                <IconButton onClick={() => setSidebarOpen(true)}>
                  <MenuRoundedIcon />
                </IconButton>
              ) : null}

              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 2.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    theme.palette.mode === "light"
                      ? alpha("#2563eb", 0.1)
                      : alpha("#38bdf8", 0.12),
                  color:
                    theme.palette.mode === "light" ? "#1d4ed8" : "#7dd3fc",
                }}
              >
                <SmartToyRoundedIcon />
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="h6"
                  fontWeight={900}
                  noWrap
                >
                  {activeChat?.name ||
                    t("page.newConversation", {
                      defaultValue: "New conversation",
                    })}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {activeChat
                    ? t("page.chatReady", {
                        defaultValue:
                          "Ask follow-up questions, request examples, or continue the thread.",
                      })
                    : t("page.welcomeSubtitle", {
                        defaultValue:
                          "Start a new AI conversation and keep all your language help in one place.",
                      })}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                icon={
                  socketStatus === "connected" ? (
                    <WifiRoundedIcon sx={{ fontSize: 16 }} />
                  ) : (
                    <WifiOffRoundedIcon sx={{ fontSize: 16 }} />
                  )
                }
                label={socketStatusLabel}
                color={socketStatus === "connected" ? "success" : "default"}
                variant={socketStatus === "connected" ? "filled" : "outlined"}
                sx={{ borderRadius: 999, maxWidth: 180 }}
              />

              {activeChat ? (
                <>
                  <IconButton
                    onClick={() => setRenameTarget(activeChat)}
                    disabled={mutatingChat}
                  >
                    <EditRoundedIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      void handleDeleteChat(activeChat);
                    }}
                    disabled={mutatingChat}
                    color="error"
                  >
                    <DeleteOutlineRoundedIcon />
                  </IconButton>
                </>
              ) : null}
            </Stack>
          </Stack>

          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              px: { xs: 1.2, md: 2.5 },
              py: 2,
            }}
          >
            {loadingMessages && activeChatId ? (
              <Stack spacing={1.4}>
                <Skeleton variant="rounded" height={88} width="68%" />
                <Skeleton variant="rounded" height={88} width="54%" sx={{ ml: "auto" }} />
                <Skeleton variant="rounded" height={96} width="74%" />
              </Stack>
            ) : activeMessages.length === 0 ? (
              <Stack
                justifyContent="center"
                alignItems="center"
                spacing={2.2}
                sx={{ minHeight: "100%" }}
              >
                <Box
                  sx={{
                    width: 78,
                    height: 78,
                    borderRadius: "24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                      theme.palette.mode === "light"
                        ? "linear-gradient(145deg, rgba(37,99,235,0.12), rgba(99,102,241,0.12))"
                        : "linear-gradient(145deg, rgba(37,99,235,0.22), rgba(99,102,241,0.18))",
                    color:
                      theme.palette.mode === "light" ? "#1d4ed8" : "#93c5fd",
                  }}
                >
                  <AutoAwesomeRoundedIcon sx={{ fontSize: 34 }} />
                </Box>

                <Stack spacing={0.7} textAlign="center" maxWidth={620}>
                  <Typography variant="h4" fontWeight={900}>
                    {t("empty.title", { defaultValue: "Start your AI chat" })}
                  </Typography>
                  <Typography color="text.secondary">
                    {t("empty.subtitle", {
                      defaultValue:
                        "Ask about grammar, request examples, explore dialects, or get help with lessons in a clean conversation flow.",
                    })}
                  </Typography>
                </Stack>

                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={1.2}
                  sx={{ width: "100%", maxWidth: 900 }}
                >
                  {suggestions.map((suggestion) => (
                    <Paper
                      key={suggestion}
                      onClick={() => {
                        void handleSend(suggestion);
                      }}
                      sx={{
                        flex: 1,
                        p: 1.6,
                        borderRadius: 3,
                        cursor: "pointer",
                        border: "1px solid",
                        borderColor: alpha("#94a3b8", 0.18),
                        background:
                          theme.palette.mode === "light"
                            ? "linear-gradient(145deg, rgba(255,255,255,0.96), rgba(248,250,252,0.94))"
                            : "linear-gradient(145deg, rgba(15,23,42,0.92), rgba(30,41,59,0.86))",
                        transition:
                          "transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          borderColor: alpha("#60a5fa", 0.36),
                          boxShadow:
                            theme.palette.mode === "light"
                              ? "0 14px 28px rgba(15,23,42,0.06)"
                              : "0 16px 34px rgba(2,6,23,0.28)",
                        },
                      }}
                    >
                      <Typography fontWeight={700} sx={{ lineHeight: 1.55 }}>
                        {suggestion}
                      </Typography>
                    </Paper>
                  ))}
                </Stack>
              </Stack>
            ) : (
              <Stack spacing={1.4}>
                {activeMessages.map((message) => (
                  <AIChatMessageBubble
                    key={`${message.id}-${message.createdAt}`}
                    message={message}
                    align={message.senderType === "assistant" ? "left" : "right"}
                    timeLabel={formatMessageTime(message.createdAt, locale)}
                    senderLabel={
                      message.senderType === "assistant"
                        ? t("messages.assistant", { defaultValue: "Assistant" })
                        : t("messages.you", { defaultValue: "You" })
                    }
                  />
                ))}

                {isTypingInActiveChat ? (
                  <Stack direction="row" spacing={1.2} alignItems="flex-end">
                    <Box
                      sx={{
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background:
                          theme.palette.mode === "light"
                            ? alpha("#2563eb", 0.1)
                            : alpha("#38bdf8", 0.12),
                        color:
                          theme.palette.mode === "light" ? "#1d4ed8" : "#93c5fd",
                      }}
                    >
                      <SmartToyRoundedIcon fontSize="small" />
                    </Box>
                    <Paper
                      elevation={0}
                      sx={{
                        px: 1.4,
                        py: 1,
                        borderRadius: 3,
                        borderBottomLeftRadius: 1,
                        border: "1px solid",
                        borderColor: alpha("#94a3b8", 0.18),
                        backgroundColor:
                          theme.palette.mode === "light"
                            ? "rgba(255,255,255,0.9)"
                            : "rgba(15,23,42,0.86)",
                      }}
                    >
                      <Typography color="text.secondary">
                        {t("messages.typing", { defaultValue: "Assistant is typing..." })}
                      </Typography>
                    </Paper>
                  </Stack>
                ) : null}

                <Box ref={bottomAnchorRef} />
              </Stack>
            )}
          </Box>

          <Box
            sx={{
              p: { xs: 1.2, md: 1.8 },
              borderTop: "1px solid",
              borderColor: alpha("#94a3b8", 0.16),
              background:
                theme.palette.mode === "light"
                  ? "rgba(255,255,255,0.94)"
                  : "rgba(15,23,42,0.92)",
            }}
          >
            <Stack spacing={1}>
              <TextField
                fullWidth
                multiline
                minRows={2}
                maxRows={8}
                value={composer}
                disabled={!isSocketReady(socketStatus) || isBusy}
                onChange={(event) => setComposer(event.target.value)}
                placeholder={t("composer.placeholder", {
                  defaultValue: "Ask anything about language, lessons, folklore, or dialects...",
                })}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void handleSend();
                  }
                }}
              />

              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "stretch", sm: "center" }}
                spacing={1}
              >
                <Typography variant="caption" color="text.secondary">
                  {isSocketReady(socketStatus)
                    ? t("composer.hintReady", {
                        defaultValue:
                          "Enter sends the message. Shift + Enter creates a new line.",
                      })
                    : t("composer.hintWaiting", {
                        defaultValue:
                          "Waiting for the real-time connection before sending messages.",
                      })}
                </Typography>

                <Button
                  variant="contained"
                  endIcon={<SendRoundedIcon />}
                  onClick={() => {
                    void handleSend();
                  }}
                  disabled={!canSend}
                  sx={{
                    alignSelf: { xs: "stretch", sm: "center" },
                    borderRadius: 999,
                    px: 2.4,
                    fontWeight: 800,
                    boxShadow:
                      "0 14px 30px rgba(37,99,235,0.28), 0 0 0 1px rgba(255,255,255,0.12)",
                  }}
                >
                  {sending
                    ? t("composer.sending", { defaultValue: "Sending..." })
                    : t("composer.send", { defaultValue: "Send" })}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Paper>
      </Box>

      {!isDesktop ? (
        <Drawer
          anchor="left"
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          PaperProps={{
            sx: {
              width: "min(92vw, 360px)",
              p: 1,
              backgroundColor:
                theme.palette.mode === "light"
                  ? "rgba(249,250,251,0.98)"
                  : "rgba(2,6,23,0.98)",
            },
          }}
        >
          {sidebar}
        </Drawer>
      ) : null}

      <AIChatRenameDialog
        open={Boolean(renameTarget)}
        initialValue={renameTarget?.name ?? ""}
        loading={mutatingChat}
        onClose={() => setRenameTarget(null)}
        onSubmit={(name) => {
          void handleRenameSubmit(name);
        }}
      />
    </Box>
  );
};

export default AIChatPage;
