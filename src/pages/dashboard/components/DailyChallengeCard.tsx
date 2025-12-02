// src/pages/dashboard/components/DailyChallengeCard.tsx
import React from "react";
import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const DailyChallengeCard: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("dashboard");

  return (
    <Paper
      elevation={0}
      sx={(theme) => ({
        flex: 0.9,
        borderRadius: 4,
        p: 2.5,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden",
        backgroundImage: theme.gradients.challenge,
        border: "1px solid rgba(148,163,184,0.4)",
        boxShadow:
          theme.palette.mode === "light"
            ? "0 16px 34px rgba(15,23,42,0.14)"
            : "0 18px 40px rgba(0,0,0,0.9)",
        color: theme.palette.mode === "light" ? "#0f172a" : "#e5e7eb",
        // лёгкий бликовый слой
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at top left, rgba(255,255,255,0.45), transparent 55%)",
          pointerEvents: "none",
        },
      })}
    >
      {/* LEFT SIDE */}
      <Box sx={{ position: "relative", zIndex: 1, maxWidth: "70%" }}>
        <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
          <Typography variant="h6" fontWeight={600}>
            {t("cards.specialTitle", "Daily challenge")}
          </Typography>
          <Chip
            label={t("cards.activityToday", "Today")}
            size="small"
            sx={{
              borderRadius: 999,
              bgcolor: "rgba(255,255,255,0.85)",
              fontSize: 11,
              height: 22,
            }}
          />
        </Stack>

        <Typography
          variant="body2"
          color="text.secondary"
          mb={1}
          sx={(theme) => ({
            color:
              theme.palette.mode === "light"
                ? "rgba(15,23,42,0.75)"
                : "rgba(226,232,240,0.85)",
          })}
        >
          {t(
            "cards.specialDesc",
            "Complete 10 new words and 1 folklore story today.",
          )}
        </Typography>

        {/* маленькие статсы квеста */}
        <Stack
          direction="row"
          spacing={2}
          mb={1.5}
          sx={{ fontSize: 12 }}
        >
          <Box>
            <Typography
              variant="caption"
              sx={{ textTransform: "uppercase", opacity: 0.75 }}
            >
              {t("cards.statsWords", "Words")}
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              0 / 10
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="caption"
              sx={{ textTransform: "uppercase", opacity: 0.75 }}
            >
              {t("cards.statsStories", "Stories")}
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              0 / 1
            </Typography>
          </Box>
        </Stack>

        <Button
          size="small"
          variant="contained"
          sx={{
            borderRadius: 999,
            textTransform: "none",
            px: 2.5,
            boxShadow: "0 10px 20px rgba(15,23,42,0.35)",
          }}
          onClick={() => navigate("/app/progress")}
        >
          {t("cards.startChallenge", "Start challenge")}
        </Button>
      </Box>

      {/* RIGHT SIDE - круг с иконкой streak/quest */}
      <Box
        sx={(theme) => ({
          position: "relative",
          zIndex: 1,
          width: 96,
          height: 96,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            theme.palette.mode === "light"
              ? "radial-gradient(circle at 30% 20%, #ffffff, #dbeafe)"
              : "radial-gradient(circle at 30% 20%, #0f172a, #1d4ed8)",
          boxShadow:
            theme.palette.mode === "light"
              ? "0 10px 26px rgba(37,99,235,0.45)"
              : "0 14px 32px rgba(0,0,0,0.9)",
        })}
      >
        <Box
          sx={(theme) => ({
            width: 68,
            height: 68,
            borderRadius: "50%",
            border: `2px solid ${
              theme.palette.mode === "light"
                ? "rgba(37,99,235,0.7)"
                : "rgba(191,219,254,0.9)"
            }`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor:
              theme.palette.mode === "light"
                ? "rgba(255,255,255,0.9)"
                : "rgba(15,23,42,0.95)",
          })}
        >
          <Typography variant="subtitle2" fontWeight={700}>
            {t("cards.streakShort", "Day 1")}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};
