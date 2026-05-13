import React, { useEffect } from "react";
import { Box, LinearProgress, Paper, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useUserProfileStore } from "@/features/profile/store/useUserProfileStore";

export const ProgressCard: React.FC = () => {
  const { t } = useTranslation("profile");
  const user = useAuthStore((s) => s.user);
  const profile = useUserProfileStore((s) => s.profile);
  const fetchProfile = useUserProfileStore((s) => s.fetchByUserId);

  useEffect(() => {
    if (!user?.id) return;
    void fetchProfile(user.id, { silent: true });
  }, [fetchProfile, user?.id]);

  const level = user?.progress?.level ?? 0;
  const currentXp = user?.progress?.xpTotal ?? 0;
  const nextXp = Math.max(user?.progress?.xpForNextLevel ?? 1, 1);
  const progress = Math.min(100, Math.round((currentXp / nextXp) * 100));

  const completedLessons = profile?.lessonsCompleted ?? 0;
  const wordsLearned = profile?.wordsLearned ?? 0;
  const currentStreak = user?.streak?.currentStreak ?? 0;

  return (
    <Paper
      elevation={0}
      sx={(theme) => ({
        flex: 1,
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
            : "0 16px 40px rgba(0,0,0,0.9)",
        position: "relative",
        overflow: "hidden",
      })}
    >
      <Box
        sx={{
          position: "absolute",
          top: -40,
          right: -40,
          width: 140,
          height: 140,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 30% 30%, rgba(251,191,36,0.35), transparent 60%)",
          pointerEvents: "none",
        }}
      />

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2.2}
        sx={{ position: "relative", zIndex: 1 }}
      >
        <Box>
          <Typography variant="h6" fontWeight={600}>
            {t("cards.progressTitle", { defaultValue: "Your progress" })}
          </Typography>
          <Typography
            variant="body2"
            sx={(theme) => ({
              mt: 0.5,
              color:
                theme.palette.mode === "light"
                  ? "rgba(75,85,99,0.9)"
                  : "rgba(156,163,175,0.95)",
            })}
          >
            {t("cards.progressSubtitle", {
              defaultValue: "Level {{level}} - {{currentXp}} / {{nextXp}} XP",
              level,
              currentXp,
              nextXp,
            })}
          </Typography>
        </Box>

        <Box
          sx={(theme) => ({
            width: 72,
            height: 72,
            borderRadius: "50%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background:
              theme.palette.mode === "light"
                ? "radial-gradient(circle at 30% 20%, #fef9c3, #facc15)"
                : "radial-gradient(circle at 30% 20%, #facc15, #b45309)",
            boxShadow:
              theme.palette.mode === "light"
                ? "0 10px 24px rgba(234,179,8,0.45)"
                : "0 12px 30px rgba(0,0,0,0.9)",
            border: "2px solid rgba(255,255,255,0.9)",
          })}
        >
          <Typography
            variant="caption"
            sx={{
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: 0.6,
              opacity: 0.85,
            }}
          >
            {t("cards.levelLabel", { defaultValue: "Level" })}
          </Typography>
          <Typography
            variant="h5"
            sx={{
              lineHeight: 1.1,
              fontWeight: 700,
            }}
          >
            {level}
          </Typography>
        </Box>
      </Stack>

      <Box sx={{ mb: 2 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={(theme) => ({
            height: 12,
            borderRadius: 999,
            backgroundColor:
              theme.palette.mode === "light"
                ? "rgba(226,232,240,0.9)"
                : "rgba(31,41,55,0.95)",
            "& .MuiLinearProgress-bar": {
              borderRadius: 999,
              backgroundImage: "linear-gradient(90deg,#22c55e,#a3e635,#facc15)",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.5)",
            },
          })}
        />
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mt={0.6}
        >
          <Typography variant="caption" color="text.secondary">
            {t("cards.xpLabel", { defaultValue: "XP progress" })}
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 500 }}>
            {t("cards.xpSummary", {
              defaultValue: "{{progress}}% - {{currentXp}} / {{nextXp}} XP",
              progress,
              currentXp,
              nextXp,
            })}
          </Typography>
        </Stack>
      </Box>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        justifyContent="space-between"
        sx={{ position: "relative", zIndex: 1 }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
          <Box
            sx={(theme) => ({
              width: 32,
              height: 32,
              borderRadius: "50%",
              background:
                theme.palette.mode === "light"
                  ? "rgba(59,130,246,0.12)"
                  : "rgba(59,130,246,0.4)",
              border: `1px solid ${
                theme.palette.mode === "light"
                  ? "rgba(59,130,246,0.4)"
                  : "rgba(191,219,254,0.9)"
              }`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 600,
              color: theme.palette.mode === "light" ? "#1d4ed8" : "#bfdbfe",
            })}
          >
            {completedLessons}
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {t("cards.completedLessons")}
            </Typography>
            <Typography variant="subtitle2" fontWeight={600}>
              {completedLessons}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
          <Box
            sx={(theme) => ({
              width: 32,
              height: 32,
              borderRadius: "50%",
              background:
                theme.palette.mode === "light"
                  ? "rgba(34,197,94,0.12)"
                  : "rgba(34,197,94,0.32)",
              border: `1px solid ${
                theme.palette.mode === "light"
                  ? "rgba(34,197,94,0.55)"
                  : "rgba(187,247,208,0.9)"
              }`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 600,
              color: theme.palette.mode === "light" ? "#15803d" : "#bbf7d0",
            })}
          >
            {wordsLearned}
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {t("cards.wordsLearned")}
            </Typography>
            <Typography variant="subtitle2" fontWeight={600}>
              {wordsLearned}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
          <Box
            sx={(theme) => ({
              width: 32,
              height: 32,
              borderRadius: "50%",
              background:
                theme.palette.mode === "light"
                  ? "rgba(234,179,8,0.12)"
                  : "rgba(250,204,21,0.25)",
              border: `1px solid ${
                theme.palette.mode === "light"
                  ? "rgba(234,179,8,0.6)"
                  : "rgba(254,240,138,0.9)"
              }`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 600,
              color: theme.palette.mode === "light" ? "#92400e" : "#fef9c3",
            })}
          >
            {currentStreak}
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {t("cards.profileStreak", { defaultValue: "Streak" })}
            </Typography>
            <Typography variant="subtitle2" fontWeight={600}>
              {t("cards.streakCurrentValue", {
                defaultValue: "{{count}} days",
                count: currentStreak,
              })}
            </Typography>
          </Box>
        </Box>
      </Stack>
    </Paper>
  );
};
