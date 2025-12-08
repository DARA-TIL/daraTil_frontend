import React from "react";
import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

type ActivityEvent = {
  id: string;
  title: string;
  meta: string;
  color: string;
};

export const RecentActivityCard: React.FC = () => {
  const { t } = useTranslation("dashboard");

  // демо-данные - потом можно заменить на реальные события из API
  const lessonName = t("cards.nextLessonName");      // "Northern dialect basics"
  const folkloreName = t("cards.folkloreName");      // "Song of the steppe"
  const level = 3;

  const events: ActivityEvent[] = [
    {
      id: "lesson-finished",
      title: t("cards.activityItem1Title", { lessonName }),
      meta: t("cards.activityItem1Meta", { minutes: 15, xp: 45 }),
      color: "#3b82f6",
    },
    {
      id: "folklore-listened",
      title: t("cards.activityItem2Title", { storyName: folkloreName }),
      meta: t("cards.activityItem2Meta", { minutes: 40, duration: 12 }),
      color: "#a855f7",
    },
    {
      id: "level-unlocked",
      title: t("cards.activityItem3Title", { level }),
      meta: t("cards.activityItem3Meta", { hours: 1 }),
      color: "#22c55e",
    },
  ];

  return (
    <Paper
      elevation={0}
      sx={(theme) => ({
        borderRadius: 4,
        p: 2.5,
        display: "flex",
        flexDirection: "column",
        backgroundColor:
          theme.palette.mode === "light" ? "#ffffff" : "rgba(15,23,42,0.9)",
        border: `1px solid ${
          theme.palette.mode === "light"
            ? "rgba(148,163,184,0.35)"
            : "rgba(15,23,42,0.9)"
        }`,
        boxShadow:
          theme.palette.mode === "light"
            ? "0 12px 30px rgba(15,23,42,0.08)"
            : "0 16px 40px rgba(0,0,0,0.85)",
      })}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2.2}
      >
        <Typography variant="h6" fontWeight={600}>
          {t("cards.activityTitle")}
        </Typography>
        <Chip
          label={t("cards.activityToday")}
          size="small"
          sx={{ borderRadius: 999 }}
        />
      </Stack>

      {/* TIMELINE */}
      {events.map((ev) => (
        <Box
          key={ev.id}
          sx={{
            position: "relative",
            mb: 2.5,
            pl: 3,
          }}
        >
          {/* Дот */}
          <Box
            sx={{
              position: "absolute",
              left: -2,
              top: 5,
              width: 12,
              height: 12,
              borderRadius: "50%",
              border: "2px solid white",
              bgcolor: ev.color,
              boxShadow: "0 0 0 3px rgba(255,255,255,0.6)",
            }}
          />

          {/* Контент события */}
          <Typography
            variant="body2"
            fontWeight={600}
            sx={{
              mb: 0.4,
            }}
          >
            {ev.title}
          </Typography>
          <Typography
            variant="caption"
            sx={(theme) => ({
              color:
                theme.palette.mode === "light"
                  ? "rgba(75,85,99,0.9)"
                  : "rgba(156,163,175,0.85)",
            })}
          >
            {ev.meta}
          </Typography>
        </Box>
      ))}
    </Paper>
  );
};
