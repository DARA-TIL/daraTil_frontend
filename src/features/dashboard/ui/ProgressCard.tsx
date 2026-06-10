import React, { useEffect } from "react";
import { Box, Button, LinearProgress, Paper, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import TranslateRoundedIcon from "@mui/icons-material/TranslateRounded";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useUserProfileStore } from "@/features/profile/store/useUserProfileStore";
import { useSavedWordsCount } from "@/features/dictionary/lib/useSavedWordsCount";

export const ProgressCard: React.FC = () => {
  const { t } = useTranslation("profile");
  const navigate = useNavigate();
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
  const xpRemaining = Math.max(nextXp - currentXp, 0);
  const nextLevel = level + 1;

  const completedLessons = profile?.lessonsCompleted ?? 0;
  const wordsLearned = useSavedWordsCount();
  const currentStreak = user?.streak?.currentStreak ?? 0;

  const statTiles = [
    {
      key: "lessons",
      label: t("cards.completedLessons"),
      display: completedLessons,
      Icon: SchoolRoundedIcon,
      light: { bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.4)", color: "#1d4ed8" },
      dark: { bg: "rgba(59,130,246,0.4)", border: "rgba(191,219,254,0.9)", color: "#bfdbfe" },
    },
    {
      key: "words",
      label: t("cards.wordsLearned"),
      display: wordsLearned,
      Icon: TranslateRoundedIcon,
      light: { bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.55)", color: "#15803d" },
      dark: { bg: "rgba(34,197,94,0.32)", border: "rgba(187,247,208,0.9)", color: "#bbf7d0" },
    },
    {
      key: "streak",
      label: t("cards.profileStreak", { defaultValue: "Streak" }),
      display: t("cards.streakCurrentValue", {
        defaultValue: "{{count}} days",
        count: currentStreak,
      }),
      Icon: LocalFireDepartmentRoundedIcon,
      light: { bg: "rgba(234,179,8,0.12)", border: "rgba(234,179,8,0.6)", color: "#92400e" },
      dark: { bg: "rgba(250,204,21,0.25)", border: "rgba(254,240,138,0.9)", color: "#fef9c3" },
    },
  ];

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
        spacing={1.5}
        sx={{
          position: "relative",
          zIndex: 1,
          flexGrow: 1,
          alignItems: "stretch",
          mt: 0.5,
        }}
      >
        {statTiles.map(({ key, label, display, Icon, light, dark }) => (
          <Box
            key={key}
            sx={(theme) => ({
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: 2,
              p: 2.5,
              minHeight: 150,
              borderRadius: 3,
              border: `1px solid ${theme.customColors.sidebarBorder}`,
              backgroundColor:
                theme.palette.mode === "light"
                  ? "rgba(248,250,252,0.7)"
                  : "rgba(15,23,42,0.5)",
            })}
          >
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Box
                sx={(theme) => {
                  const accent =
                    theme.palette.mode === "light" ? light : dark;
                  return {
                    width: 42,
                    height: 42,
                    borderRadius: "50%",
                    background: accent.bg,
                    border: `1px solid ${accent.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: accent.color,
                    flexShrink: 0,
                  };
                }}
              >
                <Icon sx={{ fontSize: 22 }} />
              </Box>
              <Typography
                variant="body2"
                color="text.secondary"
                fontWeight={700}
              >
                {label}
              </Typography>
            </Stack>

            <Typography variant="h4" fontWeight={800} sx={{ lineHeight: 1.05 }}>
              {display}
            </Typography>
          </Box>
        ))}
      </Stack>

      <Box
        sx={(theme) => ({
          mt: 2,
          p: 2,
          borderRadius: 3,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
          gap: 1.5,
          position: "relative",
          zIndex: 1,
          border: `1px solid ${theme.customColors.sidebarBorder}`,
          backgroundImage: theme.gradients.cardSoft,
        })}
      >
        <Box>
          <Typography fontWeight={800}>
            {t("cards.keepGoingTitle", { defaultValue: "Keep going" })}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("cards.xpToNextLevel", {
              defaultValue: "{{remaining}} XP left to level {{level}}",
              remaining: xpRemaining,
              level: nextLevel,
            })}
          </Typography>
        </Box>
        <Button
          variant="contained"
          endIcon={<ArrowForwardRoundedIcon />}
          onClick={() => navigate("/app/lessons")}
          sx={{
            borderRadius: 999,
            alignSelf: { xs: "flex-start", sm: "center" },
            flexShrink: 0,
          }}
        >
          {t("cards.continueLearning", { defaultValue: "Continue learning" })}
        </Button>
      </Box>
    </Paper>
  );
};
