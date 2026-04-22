import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import AutoGraphRoundedIcon from "@mui/icons-material/AutoGraphRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import { alpha, keyframes, useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { useAchievementsStore } from "@/features/achievements/store/useAchievementsStore";
import {
  getAchievementCompletionStats,
  getActionLabel,
} from "@/features/achievements/model/presentation";
import { AchievementCard } from "@/features/achievements/ui/AchievementCard";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

const summaryPulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.45); transform: translateY(0); }
  55% { box-shadow: 0 0 0 14px rgba(249, 115, 22, 0); transform: translateY(-2px); }
  100% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0); transform: translateY(0); }
`;

const ProgressPage: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation("achievements");
  const userId = useAuthStore((state) => state.user?.id ?? 0);
  const currentStreak = useAuthStore(
    (state) => state.user?.streak?.currentStreak ?? 0,
  );
  const streakEventToken = useAuthStore((state) => state.streakEventToken);
  const loading = useAchievementsStore((state) => state.loading);
  const items = useAchievementsStore((state) => state.items);
  const recentUnlockedId = useAchievementsStore((state) => state.recentUnlockedId);
  const fetchAll = useAchievementsStore((state) => state.fetchAll);
  const clearRecentUnlocked = useAchievementsStore(
    (state) => state.clearRecentUnlocked,
  );
  const [streakPulse, setStreakPulse] = useState(false);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (!recentUnlockedId) return;

    const timer = window.setTimeout(() => {
      clearRecentUnlocked();
    }, 6500);

    return () => window.clearTimeout(timer);
  }, [clearRecentUnlocked, recentUnlockedId]);

  useEffect(() => {
    if (!streakEventToken) return;

    setStreakPulse(true);
    const timer = window.setTimeout(() => {
      setStreakPulse(false);
    }, 2600);

    return () => window.clearTimeout(timer);
  }, [streakEventToken]);

  const summary = useMemo(
    () => getAchievementCompletionStats(items, userId),
    [items, userId],
  );
  const summaryEntries = summary.entries;

  const almostCompleted = useMemo(
    () =>
      summaryEntries
        .filter((entry) => entry.isStarted && !entry.isCompleted)
        .sort((left, right) => left.remaining - right.remaining || right.percent - left.percent)
        .slice(0, 4),
    [summaryEntries],
  );

  const groupedInProgress = useMemo(() => {
    const groups = new Map<string, typeof summaryEntries>();

    for (const entry of summaryEntries.filter(
      (item) => item.isStarted && !item.isCompleted,
    )) {
      const existing = groups.get(entry.achievement.action) ?? [];
      existing.push(entry);
      groups.set(entry.achievement.action, existing);
    }

    return Array.from(groups.entries());
  }, [summaryEntries]);

  const completed = useMemo(
    () =>
      summaryEntries
        .filter((entry) => entry.isCompleted)
        .sort((left, right) => {
          if (left.achievement.id === recentUnlockedId) return -1;
          if (right.achievement.id === recentUnlockedId) return 1;
          return 0;
        }),
    [recentUnlockedId, summaryEntries],
  );

  const hidden = useMemo(
    () => summaryEntries.filter((entry) => !entry.isStarted && !entry.isCompleted),
    [summaryEntries],
  );

  const summaryCards = [
    {
      key: "total",
      icon: <Inventory2RoundedIcon color="primary" />,
      value: summary.total,
      label: t("summary.total", { defaultValue: "Total achievements" }),
      highlighted: false,
    },
    {
      key: "completed",
      icon: <EmojiEventsRoundedIcon color="warning" />,
      value: summary.completed,
      label: t("summary.completed", { defaultValue: "Completed" }),
      highlighted: false,
    },
    {
      key: "inProgress",
      icon: <AutoGraphRoundedIcon color="success" />,
      value: summary.inProgress,
      label: t("summary.inProgress", { defaultValue: "In progress" }),
      highlighted: false,
    },
    {
      key: "streak",
      icon: <LocalFireDepartmentRoundedIcon sx={{ color: "#f97316" }} />,
      value: currentStreak,
      label: t("summary.currentStreak", { defaultValue: "Current streak" }),
      highlighted: streakPulse,
    },
    {
      key: "hidden",
      icon: <VisibilityOffRoundedIcon color="disabled" />,
      value: summary.hidden,
      label: t("summary.hidden", { defaultValue: "Hidden" }),
      highlighted: false,
    },
  ];

  return (
    <Box
      sx={{
        px: { xs: 1.5, md: 2.5 },
        pb: 3,
      }}
    >
      <Stack spacing={2.25}>
        <Paper
          sx={{
            p: { xs: 2, md: 2.4 },
            backgroundImage: theme.gradients.cardSoft,
            border: "1px solid",
            borderColor: theme.customColors.sidebarBorder,
          }}
        >
          <Stack spacing={0.75}>
            <Stack direction="row" spacing={1} alignItems="center">
              <EmojiEventsRoundedIcon color="primary" />
              <Typography variant="h4" fontWeight={800}>
                {t("page.title", { defaultValue: "Achievements" })}
              </Typography>
            </Stack>

            <Typography color="text.secondary" sx={{ maxWidth: 760 }}>
              {t("page.subtitle", {
                defaultValue:
                  "Track what you have unlocked, what is nearly done, and what still needs action.",
              })}
            </Typography>
          </Stack>
        </Paper>

        <Grid container spacing={2}>
          {summaryCards.map((card) => (
            <Grid key={card.key} size={{ xs: 12, sm: 6, lg: 3 }}>
              <Paper
                sx={{
                  p: 2,
                  borderRadius: 4,
                  border: "1px solid",
                  borderColor: card.highlighted
                    ? alpha("#f97316", 0.7)
                    : theme.customColors.sidebarBorder,
                  backgroundColor: "background.paper",
                  animation: card.highlighted
                    ? `${summaryPulse} 1.1s ease-out 2`
                    : "none",
                }}
              >
                <Stack direction="row" spacing={1.2} alignItems="center">
                  {card.icon}
                  <Box>
                    <Typography variant="h5" fontWeight={900}>
                      {loading ? <Skeleton width={48} /> : card.value}
                    </Typography>
                    <Typography color="text.secondary">{card.label}</Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Paper
          sx={{
            p: 2,
            borderRadius: 4,
            border: "1px solid",
            borderColor: theme.customColors.sidebarBorder,
          }}
        >
          <Stack spacing={1.5}>
            <Typography variant="h5" fontWeight={900}>
              {t("sections.almostCompleted", {
                defaultValue: "Almost completed",
              })}
            </Typography>

            {loading ? (
              <Skeleton variant="rounded" height={140} />
            ) : almostCompleted.length === 0 ? (
              <Typography color="text.secondary">
                {t("empty.almostCompleted", {
                  defaultValue: "No achievements are close to completion yet.",
                })}
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {almostCompleted.map((entry) => (
                  <Grid key={entry.achievement.id} size={{ xs: 12, md: 6 }}>
                    <AchievementCard
                      entry={entry}
                      highlighted={entry.achievement.id === recentUnlockedId}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Stack>
        </Paper>

        <Paper
          sx={{
            p: 2,
            borderRadius: 4,
            border: "1px solid",
            borderColor: theme.customColors.sidebarBorder,
          }}
        >
          <Stack spacing={1.5}>
            <Typography variant="h5" fontWeight={900}>
              {t("sections.groupedProgress", {
                defaultValue: "In progress grouped by category",
              })}
            </Typography>

            {loading ? (
              <Skeleton variant="rounded" height={180} />
            ) : groupedInProgress.length === 0 ? (
              <Typography color="text.secondary">
                {t("empty.inProgress", {
                  defaultValue: "No active achievement progress yet.",
                })}
              </Typography>
            ) : (
              <Stack spacing={2}>
                {groupedInProgress.map(([action, entries]) => (
                  <Stack key={action} spacing={1.2}>
                    <Typography fontWeight={900}>
                      {getActionLabel(action, t)}
                    </Typography>

                    <Grid container spacing={2}>
                      {entries.map((entry) => (
                        <Grid key={entry.achievement.id} size={{ xs: 12, md: 6 }}>
                          <AchievementCard
                            entry={entry}
                            highlighted={entry.achievement.id === recentUnlockedId}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Stack>
                ))}
              </Stack>
            )}
          </Stack>
        </Paper>

        <Paper
          sx={{
            p: 2,
            borderRadius: 4,
            border: "1px solid",
            borderColor: theme.customColors.sidebarBorder,
          }}
        >
          <Stack spacing={1.5}>
            <Typography variant="h5" fontWeight={900}>
              {t("sections.completed", {
                defaultValue: "Completed achievements",
              })}
            </Typography>

            {loading ? (
              <Skeleton variant="rounded" height={180} />
            ) : completed.length === 0 ? (
              <Typography color="text.secondary">
                {t("empty.completed", {
                  defaultValue: "No completed achievements yet.",
                })}
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {completed.map((entry) => (
                  <Grid key={entry.achievement.id} size={{ xs: 12, md: 6 }}>
                    <AchievementCard
                      entry={entry}
                      highlighted={entry.achievement.id === recentUnlockedId}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Stack>
        </Paper>

        <Paper
          sx={{
            p: 2,
            borderRadius: 4,
            border: "1px solid",
            borderColor: theme.customColors.sidebarBorder,
          }}
        >
          <Stack spacing={1.5}>
            <Typography variant="h5" fontWeight={900}>
              {t("sections.hidden", {
                defaultValue: "Hidden achievements",
              })}
            </Typography>

            {loading ? (
              <Skeleton variant="rounded" height={180} />
            ) : hidden.length === 0 ? (
              <Typography color="text.secondary">
                {t("empty.hidden", {
                  defaultValue: "Everything has already been revealed.",
                })}
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {hidden.map((entry) => (
                  <Grid key={entry.achievement.id} size={{ xs: 12, md: 6 }}>
                    <AchievementCard
                      entry={entry}
                      mode="hidden"
                      highlighted={entry.achievement.id === recentUnlockedId}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
};

export default ProgressPage;
