import React, { useMemo, useState } from "react";
import { Avatar, Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import type { AIChatUiMessage } from "../model/types";
import AiChatFormattedMessage from "./AiChatFormattedMessage";
import { useTranslation } from "react-i18next";

type Props = {
  message: AIChatUiMessage;
  align: "left" | "right";
  timeLabel: string;
  senderLabel: string;
};

const AIChatMessageBubble: React.FC<Props> = ({
  message,
  align,
  timeLabel,
  senderLabel,
}) => {
  const theme = useTheme();
  const isAssistant = align === "left";
  const { t } = useTranslation("aiChat");
  const [copied, setCopied] = useState(false);

  const copyLabel = useMemo(
    () =>
      copied
        ? t("messages.copied", { defaultValue: "Copied" })
        : t("messages.copy", { defaultValue: "Copy" }),
    [copied, t],
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Stack
      direction="row"
      spacing={1.2}
      justifyContent={isAssistant ? "flex-start" : "flex-end"}
      alignItems="flex-end"
    >
      {isAssistant ? (
        <Avatar
          sx={{
            width: 34,
            height: 34,
            background:
              theme.palette.mode === "light"
                ? alpha("#2563eb", 0.12)
                : alpha("#38bdf8", 0.16),
            color: theme.palette.mode === "light" ? "#1d4ed8" : "#7dd3fc",
          }}
        >
          <SmartToyRoundedIcon fontSize="small" />
        </Avatar>
      ) : null}

      <Box
        sx={{
          maxWidth: { xs: "88%", md: "78%" },
          px: 1.5,
          py: 1.2,
          borderRadius: 3.5,
          borderBottomLeftRadius: isAssistant ? 1 : 3.5,
          borderBottomRightRadius: isAssistant ? 3.5 : 1,
          background: isAssistant
            ? theme.palette.mode === "light"
              ? "linear-gradient(145deg, rgba(255,255,255,0.96), rgba(248,250,252,0.94))"
              : "linear-gradient(145deg, rgba(15,23,42,0.98), rgba(30,41,59,0.9))"
            : "linear-gradient(145deg, rgba(37,99,235,0.96), rgba(99,102,241,0.96))",
          color: isAssistant ? "text.primary" : "#f8fafc",
          border: `1px solid ${
            isAssistant
              ? theme.palette.mode === "light"
                ? "rgba(148,163,184,0.24)"
                : "rgba(99,102,241,0.16)"
              : "rgba(255,255,255,0.08)"
          }`,
          boxShadow: isAssistant
            ? theme.palette.mode === "light"
              ? "0 14px 28px rgba(15,23,42,0.06)"
              : "0 18px 36px rgba(2,6,23,0.28)"
            : "0 18px 34px rgba(37,99,235,0.24)",
        }}
      >
        <AiChatFormattedMessage
          text={message.message}
          color={isAssistant ? theme.palette.text.primary : "#f8fafc"}
        />

        <Stack
          direction="row"
          spacing={1}
          justifyContent="space-between"
          alignItems="center"
          mt={1}
        >
          <Typography
            variant="caption"
            sx={{
              color: isAssistant
                ? theme.palette.text.secondary
                : "rgba(255,255,255,0.78)",
            }}
          >
            {senderLabel}
          </Typography>

          <Stack direction="row" spacing={0.35} alignItems="center">
            {isAssistant ? (
              <Tooltip title={copyLabel}>
                <span>
                  <IconButton
                    size="small"
                    onClick={handleCopy}
                    sx={{
                      width: 24,
                      height: 24,
                      color: copied
                        ? "#22c55e"
                        : isAssistant
                          ? theme.palette.text.secondary
                          : "rgba(255,255,255,0.72)",
                      "&:hover": {
                        backgroundColor: isAssistant
                          ? alpha(theme.palette.text.primary, 0.06)
                          : "rgba(255,255,255,0.12)",
                      },
                    }}
                  >
                    {copied ? (
                      <CheckRoundedIcon sx={{ fontSize: 15 }} />
                    ) : (
                      <ContentCopyRoundedIcon sx={{ fontSize: 15 }} />
                    )}
                  </IconButton>
                </span>
              </Tooltip>
            ) : null}

            <Typography
              variant="caption"
              sx={{
                color: isAssistant
                  ? theme.palette.text.secondary
                  : "rgba(255,255,255,0.72)",
              }}
            >
              {message.pending ? "..." : message.failed ? "!" : timeLabel}
            </Typography>
          </Stack>
        </Stack>
      </Box>

      {!isAssistant ? (
        <Avatar
          sx={{
            width: 34,
            height: 34,
            background:
              theme.palette.mode === "light"
                ? alpha("#0f172a", 0.08)
                : alpha("#ffffff", 0.08),
            color: theme.palette.mode === "light" ? "#0f172a" : "#f8fafc",
          }}
        >
          <PersonRoundedIcon fontSize="small" />
        </Avatar>
      ) : null}
    </Stack>
  );
};

export default AIChatMessageBubble;
