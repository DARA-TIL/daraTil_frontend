import React from "react";
import { Box, Grid, LinearProgress, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useUserProfileStore } from "@/features/profile/store/useUserProfileStore";
import ProfileSectionCard from "../ProfileSectionCard";

const ProfileLearningTab: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation("profile");
  const user = useAuthStore((s) => s.user);
  const profile = useUserProfileStore((s) => s.profile);

  if (!user) return null;

  const xpTotal = user.progress?.xpTotal ?? 0;
  const xpNext = Math.max(user.progress?.xpForNextLevel ?? 1, 1);
  const percent = Math.min(100, Math.round((xpTotal / xpNext) * 100));
  const lessonsCompleted = profile?.lessonsCompleted ?? 0;
  const wordsLearned = profile?.wordsLearned ?? 0;
  const currentStreak = user.streak?.currentStreak ?? 0;
  const longestStreak = user.streak?.longestStreak ?? 0;
  const pinnedCount = profile?.pinnedAchievements.length ?? 0;

  const snapshotItems = [
    {
      title: t("learning.level", { defaultValue: "Current level" }),
      value: user.progress?.level ?? 0,
    },
    {
      title: t("learning.xpCurrent", { defaultValue: "Current XP" }),
      value: xpTotal,
    },
    {
      title: t("learning.xpNext", { defaultValue: "Next level at" }),
      value: `${xpNext} XP`,
    },
    {
      title: t("learning.longestStreak", { defaultValue: "Longest streak" }),
      value: t("cards.streakLongestValue", {
        count: longestStreak,
        defaultValue: "{{count}} days",
      }),
    },
  ];

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 7 }}>
        <ProfileSectionCard>
          <Typography fontWeight={800} mb={1}>
            {t("learning.progressTitle", { defaultValue: "Level progress" })}
          </Typography>

          <Typography variant="body2" color="text.secondary" mb={2}>
            {t("learning.progressSubtitle", {
              defaultValue:
                "Everything here is calculated from your real profile data.",
            })}
          </Typography>

          <LinearProgress
            variant="determinate"
            value={percent}
            sx={{ height: 14, borderRadius: 999 }}
          />

          <Stack direction="row" justifyContent="space-between" mt={1}>
            <Typography variant="body2">{xpTotal} XP</Typography>
            <Typography variant="body2" color="text.secondary">
              {t("learning.xpNext", { defaultValue: "Next level at" })}: {xpNext} XP
            </Typography>
          </Stack>

          <Grid container spacing={2} mt={1}>
            {[
              {
                label: t("cards.completedLessons"),
                value: lessonsCompleted,
              },
              {
                label: t("cards.wordsLearned"),
                value: wordsLearned,
              },
              {
                label: t("cards.profileStreak", { defaultValue: "Streak" }),
                value: t("cards.streakCurrentValue", {
                  count: currentStreak,
                  defaultValue: "{{count}} days",
                }),
              },
              {
                label: t("cards.pinnedAchievements"),
                value: pinnedCount,
              },
            ].map((item) => (
              <Grid key={item.label} size={{ xs: 12, sm: 6 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: theme.customColors.sidebarBorder,
                    backgroundColor:
                      theme.palette.mode === "light"
                        ? "rgba(255,255,255,0.85)"
                        : "rgba(15,23,42,0.55)",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {item.label}
                  </Typography>
                  <Typography fontWeight={800}>{item.value}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </ProfileSectionCard>
      </Grid>

      <Grid size={{ xs: 12, md: 5 }}>
        <ProfileSectionCard>
          <Typography fontWeight={800} mb={1}>
            {t("learning.snapshotTitle", {
              defaultValue: "Learning snapshot",
            })}
          </Typography>

          <Typography variant="body2" color="text.secondary" mb={2}>
            {t("learning.snapshotSubtitle", {
              defaultValue:
                "A clean view of the stats currently available from backend.",
            })}
          </Typography>

          <Stack spacing={1.25}>
            {snapshotItems.map((item) => (
              <Box
                key={item.title}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: theme.customColors.sidebarBorder,
                  backgroundColor:
                    theme.palette.mode === "light"
                      ? "rgba(255,255,255,0.85)"
                      : "rgba(15,23,42,0.55)",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {item.title}
                </Typography>
                <Typography fontWeight={800}>{item.value}</Typography>
              </Box>
            ))}
          </Stack>

          <Box mt={2.5}>
            <Typography fontWeight={800} mb={1}>
              {t("learning.pinnedListTitle", {
                defaultValue: "Pinned now",
              })}
            </Typography>

            {!profile?.pinnedAchievements.length ? (
              <Typography variant="body2" color="text.secondary">
                {t("learning.pinnedEmpty", {
                  defaultValue: "No pinned achievements yet.",
                })}
              </Typography>
            ) : (
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {profile.pinnedAchievements.map((item) => (
                  <Box
                    key={item.id}
                    sx={{
                      px: 1.25,
                      py: 0.9,
                      borderRadius: 999,
                      border: "1px solid",
                      borderColor: theme.customColors.sidebarBorder,
                      backgroundColor:
                        theme.palette.mode === "light"
                          ? "rgba(255,255,255,0.85)"
                          : "rgba(15,23,42,0.55)",
                    }}
                  >
                    <Typography variant="body2" fontWeight={700}>
                      {item.name}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>
        </ProfileSectionCard>
      </Grid>
    </Grid>
  );
};

export default ProfileLearningTab;
