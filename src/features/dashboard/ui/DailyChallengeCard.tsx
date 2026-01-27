import React from "react";
import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const DailyChallengeCard: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("dashboard");

  // временные заглушки - потом можно будет брать из стора / API
  const wordsCompleted = 0;
  const wordsTarget = 10;
  const storiesCompleted = 0;
  const storiesTarget = 1;
  const currentDay = 1;

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
            : "0 16px 40px rgba(0,0,0,0.9)",
        color: theme.palette.mode === "light" ? "#0f172a" : "#e5e7eb",
      })}
    >
      {/* мягкий блик слева сверху, в стиле ProgressCard */}
      <Box
        sx={{
          position: "absolute",
          top: -40,
          left: -40,
          width: 140,
          height: 140,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 30% 30%, rgba(59,130,246,0.28), transparent 60%)",
          pointerEvents: "none",
        }}
      />

      {/* LEFT SIDE */}
      <Box sx={{ position: "relative", zIndex: 1, maxWidth: "70%" }}>
        <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
          <Typography variant="h6" fontWeight={600}>
            {t("cards.specialTitle")}
          </Typography>
          <Chip
            label={t("cards.activityToday")}
            size="small"
            sx={{
              borderRadius: 999,
              fontSize: 11,
              height: 22,
            }}
          />
        </Stack>

        <Typography
          variant="body2"
          mb={1}
          sx={(theme) => ({
            color:
              theme.palette.mode === "light"
                ? "rgba(75,85,99,0.9)"
                : "rgba(156,163,175,0.95)",
          })}
        >
          {t("cards.specialDesc", {
            wordsTarget,
            storiesTarget,
          })}
        </Typography>

        {/* маленькие статсы квеста */}
        <Stack direction="row" spacing={2} mb={1.5} sx={{ fontSize: 12 }}>
          <Box>
            <Typography
              variant="caption"
              sx={{ textTransform: "uppercase", opacity: 0.75 }}
            >
              {t("cards.statsWords")}
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {wordsCompleted} / {wordsTarget}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="caption"
              sx={{ textTransform: "uppercase", opacity: 0.75 }}
            >
              {t("cards.statsStories")}
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {storiesCompleted} / {storiesTarget}
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
          {t("cards.startChallenge")}
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
              ? "radial-gradient(circle at 30% 20%, #eff6ff, #dbeafe)"
              : "radial-gradient(circle at 30% 20%, #0f172a, #1d4ed8)",
          boxShadow:
            theme.palette.mode === "light"
              ? "0 10px 26px rgba(37,99,235,0.35)"
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
                ? "rgba(255,255,255,0.98)"
                : "rgba(15,23,42,0.98)",
          })}
        >
          <Typography variant="subtitle2" fontWeight={700}>
            {t("cards.streakShort", { day: currentDay })}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};
