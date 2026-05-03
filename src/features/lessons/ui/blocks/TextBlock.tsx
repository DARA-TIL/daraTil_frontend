import React from "react";
import { Box, Chip, Paper, Stack, Typography, useTheme } from "@mui/material";
import SubjectIcon from "@mui/icons-material/Subject";
import type { LessonBlock } from "../../model/types";
import { useTranslation } from "react-i18next";
import { AssistantSelectionSurface } from "@/features/assistant/ui/AssistantSelectionSurface";
import { normalizeAssistantLanguage } from "@/features/assistant/model/helpers";

const TextBlock: React.FC<{ block: LessonBlock }> = ({ block }) => {
  const theme = useTheme();
  const { i18n } = useTranslation();
  const contentText = block.contentText?.trim() || "";

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 4,
        border: "1px solid",
        borderColor: theme.customColors.sidebarBorder,
        backgroundColor:
          theme.palette.mode === "light" ? "#fff" : "rgba(15,23,42,0.7)",
        boxShadow:
          theme.palette.mode === "light"
            ? "0 12px 30px rgba(15,23,42,0.06)"
            : "0 16px 40px rgba(0,0,0,0.8)",
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
        <Stack direction="row" gap={1} alignItems="center" sx={{ minWidth: 0 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 3,
              backgroundImage: theme.gradients.dashboardHeader,
              display: "grid",
              placeItems: "center",
              boxShadow: "0 10px 22px rgba(15,23,42,0.25)",
              flexShrink: 0,
            }}
          >
            <SubjectIcon sx={{ color: "#fff", fontSize: 18 }} />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography fontWeight={900} noWrap>
              {block.position}. {block.name || "Text block"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Text
            </Typography>
          </Box>
        </Stack>

        <Chip
          size="small"
          label={`#${block.position}`}
          sx={{
            borderRadius: 999,
            bgcolor:
              theme.palette.mode === "light"
                ? "rgba(37,99,235,0.10)"
                : "rgba(37,99,235,0.25)",
            border: "1px solid",
            borderColor:
              theme.palette.mode === "light"
                ? "rgba(37,99,235,0.20)"
                : "rgba(255,255,255,0.10)",
            fontWeight: 700,
          }}
        />
      </Stack>

      <AssistantSelectionSurface
        block={contentText}
        language={normalizeAssistantLanguage(i18n.resolvedLanguage ?? i18n.language)}
      >
        <Typography
          sx={{
            mt: 1.2,
            whiteSpace: "pre-wrap",
            lineHeight: 1.65,
          }}
        >
          {contentText || "No text content."}
        </Typography>
      </AssistantSelectionSurface>
    </Paper>
  );
};

export default TextBlock;
