import React from "react";
import { alpha, useTheme } from "@mui/material/styles";
import {
  Box,
  Chip,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import FlagRoundedIcon from "@mui/icons-material/FlagRounded";
import type { AchievementProgressEntry } from "../model/presentation";
import { getActionLabel } from "../model/presentation";
import { useTranslation } from "react-i18next";

type Props = {
  entry: AchievementProgressEntry;
  mode?: "default" | "hidden";
};

export const AchievementCard: React.FC<Props> = ({ entry, mode = "default" }) => {
  const theme = useTheme();
  const { t } = useTranslation("achievements");

  const { achievement, progress, percent, remaining, isCompleted } = entry;
  const isHidden = mode === "hidden";

  return (
    <Paper
      sx={{
        p: 1.8,
        borderRadius: 4,
        border: "1px solid",
        borderColor: theme.customColors.sidebarBorder,
        backgroundImage: isCompleted
          ? theme.gradients.cardSoft
          : "none",
        opacity: isHidden ? 0.86 : 1,
      }}
    >
      <Stack spacing={1.25}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          gap={1}
        >
          <Stack direction="row" spacing={1.2} alignItems="center">
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: 3,
                overflow: "hidden",
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                backgroundImage: achievement.iconUrl
                  ? `url(${achievement.iconUrl})`
                  : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {achievement.iconUrl ? null : isHidden ? (
                <LockRoundedIcon color="disabled" />
              ) : isCompleted ? (
                <EmojiEventsRoundedIcon color="warning" />
              ) : (
                <FlagRoundedIcon color="primary" />
              )}
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography fontWeight={900} noWrap>
                {achievement.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {getActionLabel(achievement.action, t)}
              </Typography>
            </Box>
          </Stack>

          <Chip
            size="small"
            color={isCompleted ? "success" : "default"}
            label={isCompleted
              ? t("card.completed", { defaultValue: "Completed" })
              : isHidden
                ? t("card.hidden", { defaultValue: "Hidden" })
                : t("card.inProgress", { defaultValue: "In progress" })}
            sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
          />
        </Stack>

        <Typography color="text.secondary">
          {isHidden
            ? t("card.hiddenDescription", {
                defaultValue: "Start related actions to reveal progress for this achievement.",
              })
            : achievement.description}
        </Typography>

        <Stack spacing={0.6}>
          <Stack direction="row" justifyContent="space-between" spacing={1}>
            <Typography variant="body2" color="text.secondary">
              {t("card.progress", {
                defaultValue: "Progress {{current}} / {{target}}",
                current: progress.quantity,
                target: achievement.quantity,
              })}
            </Typography>
            <Typography variant="body2" fontWeight={800}>
              {percent}%
            </Typography>
          </Stack>

          <LinearProgress
            variant="determinate"
            value={percent}
            sx={{
              height: 10,
              borderRadius: 999,
            }}
          />
        </Stack>

        <Typography variant="body2" color="text.secondary">
          {isCompleted
            ? t("card.done", {
                defaultValue: "You have completed this achievement.",
              })
            : t("card.remaining", {
                defaultValue: "{{count}} actions left",
                count: remaining,
              })}
        </Typography>
      </Stack>
    </Paper>
  );
};
