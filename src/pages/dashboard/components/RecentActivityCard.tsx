// src/pages/dashboard/components/RecentActivityCard.tsx
import React from "react";
import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

export const RecentActivityCard: React.FC = () => {
  const { t } = useTranslation("dashboard");

  const events = [
    {
      title: t(
        "cards.activityItem1Title",
        'Finished lesson: "Northern dialect basics"'
      ),
      meta: t("cards.activityItem1Meta", "15 min ago • +45 XP"),
      color: "#3b82f6", // blue
    },
    {
      title: t(
        "cards.activityItem2Title",
        'Listened to folklore story "Song of the steppe"'
      ),
      meta: t("cards.activityItem2Meta", "40 min ago • 12 min"),
      color: "#a855f7", // purple
    },
    {
      title: t("cards.activityItem3Title", "Unlocked level 3 achievements"),
      meta: t("cards.activityItem3Meta", "1 hour ago"),
      color: "#22c55e", // green
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
          {t("cards.activityTitle", "Recent activity")}
        </Typography>
        <Chip
          label={t("cards.activityToday", "Today")}
          size="small"
          sx={{ borderRadius: 999 }}
        />
      </Stack>

      {/* TIMELINE */}
      <Box
        sx={{
          position: "relative",
          pl: 2.5,
          "&::before": {
            content: '""',
            position: "absolute",
            left: 12,
            top: 6,
            bottom: 0,
            width: "2px",
            bgcolor: "rgba(148,163,184,0.4)",
          },
        }}
      >
        {events.map((ev, i) => (
          <Box
            key={i}
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
      </Box>
    </Paper>
  );
};
