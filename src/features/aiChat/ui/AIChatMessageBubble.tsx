import React from "react";
import { Avatar, Box, Stack, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import type { AIChatUiMessage } from "../model/types";

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
        <Typography
          sx={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            lineHeight: 1.65,
            fontSize: 15,
          }}
        >
          {message.message}
        </Typography>

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
