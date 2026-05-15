import React, { useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import { useTranslation } from "react-i18next";
import {
  buildChatPreview,
  formatChatDate,
} from "../model/presentation";
import type { AIChatResponse } from "../model/types";

type Props = {
  activeChatId: number | null;
  chats: AIChatResponse[];
  loading: boolean;
  query: string;
  onQueryChange: (value: string) => void;
  onNewChat: () => void;
  onRefresh: () => void;
  onSelectChat: (chatId: number) => void;
  onRenameChat: (chat: AIChatResponse) => void;
  onDeleteChat: (chat: AIChatResponse) => void;
};

const AIChatSidebar: React.FC<Props> = ({
  activeChatId,
  chats,
  loading,
  query,
  onQueryChange,
  onNewChat,
  onRefresh,
  onSelectChat,
  onRenameChat,
  onDeleteChat,
}) => {
  const theme = useTheme();
  const { t, i18n } = useTranslation("aiChat");
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [menuChat, setMenuChat] = useState<AIChatResponse | null>(null);

  const locale = i18n.resolvedLanguage ?? "en";

  const filteredChats = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return chats;

    return chats.filter((chat) =>
      `${chat.name} ${chat.lastMessage?.message ?? ""}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [chats, query]);

  const openMenu = (
    event: React.MouseEvent<HTMLElement>,
    chat: AIChatResponse,
  ) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setMenuChat(chat);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuChat(null);
  };

  return (
    <Paper
      sx={{
        height: "100%",
        minHeight: 560,
        display: "flex",
        flexDirection: "column",
        borderRadius: 4,
        border: "1px solid",
        borderColor: theme.customColors.sidebarBorder,
        overflow: "hidden",
      }}
    >
      <Stack spacing={1.5} sx={{ p: 2 }}>
        <Stack direction="row" spacing={1} justifyContent="space-between">
          <Button
            fullWidth
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={onNewChat}
            sx={{ borderRadius: 999, fontWeight: 800 }}
          >
            {t("sidebar.newChat", { defaultValue: "New chat" })}
          </Button>

          <IconButton
            onClick={onRefresh}
            sx={{
              border: "1px solid",
              borderColor: theme.customColors.sidebarBorder,
              borderRadius: 999,
            }}
          >
            <RefreshRoundedIcon />
          </IconButton>
        </Stack>

        <TextField
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={t("sidebar.searchPlaceholder", {
            defaultValue: "Search chats...",
          })}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon sx={{ color: "text.secondary" }} />
              </InputAdornment>
            ),
          }}
        />

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip
            size="small"
            label={t("sidebar.totalChats", {
              defaultValue: "{{count}} chats",
              count: chats.length,
            })}
          />
          <Chip
            size="small"
            label={t("sidebar.filteredChats", {
              defaultValue: "{{count}} visible",
              count: filteredChats.length,
            })}
            variant="outlined"
          />
        </Stack>
      </Stack>

      <Divider />

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          p: 1.2,
        }}
      >
        <Stack spacing={1}>
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} variant="rounded" height={82} />
            ))
          ) : filteredChats.length === 0 ? (
            <Box
              sx={{
                py: 6,
                px: 2,
                textAlign: "center",
                color: "text.secondary",
              }}
            >
              <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 34, mb: 1, opacity: 0.65 }} />
              <Typography fontWeight={800} sx={{ mb: 0.5 }}>
                {t("sidebar.emptyTitle", { defaultValue: "No chats yet" })}
              </Typography>
              <Typography variant="body2">
                {t("sidebar.emptyDescription", {
                  defaultValue:
                    "Start a new conversation and your AI chats will appear here.",
                })}
              </Typography>
            </Box>
          ) : (
            filteredChats.map((chat) => {
              const selected = chat.id === activeChatId;
              return (
                <Box
                  key={chat.id}
                  onClick={() => onSelectChat(chat.id)}
                  sx={{
                    p: 1.4,
                    borderRadius: 3,
                    cursor: "pointer",
                    border: "1px solid",
                    borderColor: selected
                      ? alpha("#2563eb", 0.5)
                      : alpha("#94a3b8", 0.16),
                    background: selected
                      ? theme.palette.mode === "light"
                        ? "linear-gradient(145deg, rgba(239,246,255,0.98), rgba(238,242,255,0.95))"
                        : "linear-gradient(145deg, rgba(30,41,59,0.96), rgba(30,27,75,0.92))"
                      : "transparent",
                    transition:
                      "transform 180ms ease, border-color 180ms ease, background 180ms ease",
                    "&:hover": {
                      transform: "translateY(-1px)",
                      borderColor: alpha("#60a5fa", 0.4),
                    },
                  }}
                >
                  <Stack direction="row" spacing={1.1} alignItems="flex-start">
                    <Avatar
                      sx={{
                        width: 38,
                        height: 38,
                        fontWeight: 900,
                        backgroundColor: selected
                          ? alpha("#2563eb", 0.14)
                          : alpha("#0f172a", theme.palette.mode === "light" ? 0.06 : 0.16),
                        color: selected
                          ? "#2563eb"
                          : theme.palette.mode === "light"
                            ? "#0f172a"
                            : "#f8fafc",
                      }}
                    >
                      {chat.name.charAt(0).toUpperCase()}
                    </Avatar>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="space-between"
                        alignItems="flex-start"
                      >
                        <Typography
                          fontWeight={800}
                          noWrap
                          sx={{ flex: 1, minWidth: 0 }}
                        >
                          {chat.name}
                        </Typography>

                        <IconButton
                          size="small"
                          onClick={(event) => openMenu(event, chat)}
                        >
                          <MoreHorizRoundedIcon fontSize="small" />
                        </IconButton>
                      </Stack>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 0.35,
                          minHeight: 40,
                          display: "-webkit-box",
                          WebkitBoxOrient: "vertical",
                          WebkitLineClamp: 2,
                          overflow: "hidden",
                          wordBreak: "break-word",
                        }}
                      >
                        {buildChatPreview(
                          chat,
                          t("sidebar.previewFallback", {
                            defaultValue: "No messages yet",
                          }),
                        )}
                      </Typography>

                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75 }}>
                        {formatChatDate(
                          chat.lastMessage?.createdAt || chat.updatedAt || chat.createdAt,
                          locale,
                        )}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              );
            })
          )}
        </Stack>
      </Box>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor && menuChat)}
        onClose={closeMenu}
      >
        <MenuItem
          onClick={() => {
            if (menuChat) onRenameChat(menuChat);
            closeMenu();
          }}
        >
          <EditRoundedIcon fontSize="small" sx={{ mr: 1 }} />
          {t("sidebar.rename", { defaultValue: "Rename" })}
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuChat) onDeleteChat(menuChat);
            closeMenu();
          }}
          sx={{ color: "error.main" }}
        >
          <DeleteOutlineRoundedIcon fontSize="small" sx={{ mr: 1 }} />
          {t("sidebar.delete", { defaultValue: "Delete" })}
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default AIChatSidebar;
