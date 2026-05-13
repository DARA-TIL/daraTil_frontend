import React, { useEffect, useMemo, useState } from "react";
import {
  alpha,
  useTheme,
} from "@mui/material/styles";
import {
  Avatar,
  Box,
  Chip,
  Grid,
  Paper,
  Skeleton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import LeaderboardRoundedIcon from "@mui/icons-material/LeaderboardRounded";
import MilitaryTechRoundedIcon from "@mui/icons-material/MilitaryTechRounded";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import TranslateRoundedIcon from "@mui/icons-material/TranslateRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useLeaderboardStore } from "@/features/leaderboard/store/useLeaderboardStore";
import type { LeaderboardMetric, LeaderboardProfileEntry } from "@/features/leaderboard/model/types";
import type { IUser } from "@/features/auth/model/IUser";

type PodiumItem = {
  rank: number;
  title: string;
  subtitle: string;
  value: string;
  avatar?: string;
  isCurrentUser: boolean;
  extra?: React.ReactNode;
};

function isProfileEntry(
  entry: IUser | LeaderboardProfileEntry,
): entry is LeaderboardProfileEntry {
  return "wordsLearned" in entry;
}

function getEntryUser(
  entry: IUser | LeaderboardProfileEntry,
): IUser | null {
  return isProfileEntry(entry) ? entry.user : entry;
}

function getMetricValue(
  entry: IUser | LeaderboardProfileEntry,
  metric: LeaderboardMetric,
): number {
  if (metric === "xp") {
    return isProfileEntry(entry)
      ? entry.user?.progress?.xpTotal ?? 0
      : entry.progress?.xpTotal ?? 0;
  }

  if (metric === "streak") {
    return isProfileEntry(entry)
      ? entry.user?.streak?.currentStreak ?? 0
      : entry.streak?.currentStreak ?? 0;
  }

  return isProfileEntry(entry) ? entry.wordsLearned : 0;
}

function getMetricLabel(
  metric: LeaderboardMetric,
  value: number,
  t: (key: string, options?: Record<string, unknown>) => string,
): string {
  if (metric === "xp") {
    return t("metrics.xpValue", {
      defaultValue: "{{count}} XP",
      count: value,
    });
  }

  if (metric === "streak") {
    return t("metrics.streakValue", {
      defaultValue: "{{count}} days",
      count: value,
    });
  }

  return t("metrics.wordValue", {
    defaultValue: "{{count}} words",
    count: value,
  });
}

function getMetricIcon(metric: LeaderboardMetric) {
  if (metric === "xp") return <BoltRoundedIcon color="primary" />;
  if (metric === "streak") {
    return <LocalFireDepartmentRoundedIcon sx={{ color: "#f97316" }} />;
  }
  return <TranslateRoundedIcon color="success" />;
}

function getMetricColor(metric: LeaderboardMetric): string {
  if (metric === "xp") return "#2563eb";
  if (metric === "streak") return "#f97316";
  return "#16a34a";
}

const LIMIT_OPTIONS = [5, 10, 15] as const;

const LeaderboardPage: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation("leaderboard");
  const currentUserId = useAuthStore((state) => state.user?.id ?? 0);
  const loading = useLeaderboardStore((state) => state.loading);
  const limit = useLeaderboardStore((state) => state.limit);
  const xpItems = useLeaderboardStore((state) => state.xpItems);
  const streakItems = useLeaderboardStore((state) => state.streakItems);
  const wordItems = useLeaderboardStore((state) => state.wordItems);
  const fetchAll = useLeaderboardStore((state) => state.fetchAll);

  const [metric, setMetric] = useState<LeaderboardMetric>("xp");

  useEffect(() => {
    void fetchAll(limit);
  }, [fetchAll, limit]);

  const metricCards = useMemo(
    () => [
      {
        key: "xp" as const,
        label: t("metrics.xp", { defaultValue: "XP" }),
        icon: <BoltRoundedIcon color="primary" />,
        items: xpItems,
      },
      {
        key: "streak" as const,
        label: t("metrics.streak", { defaultValue: "Streak" }),
        icon: <LocalFireDepartmentRoundedIcon sx={{ color: "#f97316" }} />,
        items: streakItems,
      },
      {
        key: "word" as const,
        label: t("metrics.word", { defaultValue: "Words learned" }),
        icon: <TranslateRoundedIcon color="success" />,
        items: wordItems,
      },
    ],
    [streakItems, t, wordItems, xpItems],
  );

  const selectedItems = useMemo(() => {
    if (metric === "xp") return xpItems;
    if (metric === "streak") return streakItems;
    return wordItems;
  }, [metric, streakItems, wordItems, xpItems]);

  const podiumItems = useMemo<PodiumItem[]>(() => {
    const topThree = selectedItems.slice(0, 3);

    return topThree.map((entry, index) => {
      const user = getEntryUser(entry);
      const value = getMetricValue(entry, metric);
      const lessonsCompleted = isProfileEntry(entry) ? entry.lessonsCompleted : 0;
      const pinned = isProfileEntry(entry)
        ? entry.pinnedAchievements.slice(0, 2)
        : [];

      return {
        rank: index + 1,
        title:
          user?.username ||
          t("labels.unknownUser", { defaultValue: "Unknown user" }),
        subtitle:
          metric === "word"
            ? t("labels.wordSubtitle", {
                defaultValue: "{{count}} lessons completed",
                count: lessonsCompleted,
              })
            : t("labels.levelSubtitle", {
                defaultValue: "Level {{count}}",
                count: user?.progress?.level ?? 0,
              }),
        value: getMetricLabel(metric, value, t),
        avatar: user?.avatar,
        isCurrentUser:
          Number(user?.id ?? (isProfileEntry(entry) ? entry.userId : 0)) ===
          Number(currentUserId),
        extra:
          pinned.length > 0 ? (
            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
              {pinned.map((achievement) => (
                <Chip
                  key={`${achievement.id}-${achievement.name}`}
                  size="small"
                  label={achievement.name}
                  sx={{
                    backgroundColor: "rgba(255,255,255,0.14)",
                    color: "#fff",
                  }}
                />
              ))}
            </Stack>
          ) : null,
      };
    });
  }, [currentUserId, metric, selectedItems, t]);

  const currentUserRank = useMemo(() => {
    if (!currentUserId) return null;

    const index = selectedItems.findIndex((entry) => {
      const user = getEntryUser(entry);
      const id = user?.id ?? (isProfileEntry(entry) ? entry.userId : 0);
      return Number(id) === Number(currentUserId);
    });

    return index >= 0 ? index + 1 : null;
  }, [currentUserId, selectedItems]);

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
            p: { xs: 2, md: 2.5 },
            backgroundImage: theme.gradients.cardSoft,
            border: "1px solid",
            borderColor: theme.customColors.sidebarBorder,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: -70,
              right: -70,
              width: 220,
              height: 220,
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 30% 30%, rgba(59,130,246,0.18), transparent 65%)",
              pointerEvents: "none",
            }}
          />

          <Stack
            direction={{ xs: "column", lg: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", lg: "center" }}
            sx={{ position: "relative", zIndex: 1 }}
          >
            <Stack spacing={0.8}>
              <Stack direction="row" spacing={1} alignItems="center">
                <LeaderboardRoundedIcon color="primary" />
                <Typography variant="h4" fontWeight={800}>
                  {t("page.title", { defaultValue: "Leaderboard" })}
                </Typography>
              </Stack>

              <Typography color="text.secondary" sx={{ maxWidth: 760 }}>
                {t("page.subtitle", {
                  defaultValue:
                    "Track the strongest learners by XP, streak, and words learned across the platform.",
                })}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                color="primary"
                label={
                  currentUserRank
                    ? t("page.myRank", {
                        defaultValue: "Your rank: #{{rank}}",
                        rank: currentUserRank,
                      })
                    : t("page.notInTop", {
                        defaultValue: "Not in current top",
                      })
                }
              />
              <Chip
                variant="outlined"
                label={t("page.limitLabel", {
                  defaultValue: "Top {{count}}",
                  count: limit,
                })}
              />
            </Stack>
          </Stack>
        </Paper>

        <Grid container spacing={2}>
          {metricCards.map((card) => {
            const leader = card.items[0];
            const user = leader ? getEntryUser(leader) : null;
            const score = leader ? getMetricValue(leader, card.key) : 0;
            const selected = metric === card.key;

            return (
              <Grid key={card.key} size={{ xs: 12, md: 4 }}>
                <Paper
                  onClick={() => setMetric(card.key)}
                  sx={{
                    p: 2,
                    borderRadius: 4,
                    border: "1px solid",
                    borderColor: selected
                      ? alpha(getMetricColor(card.key), 0.7)
                      : theme.customColors.sidebarBorder,
                    backgroundImage: selected ? theme.gradients.cardSoft : "none",
                    cursor: "pointer",
                    transition:
                      "transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow:
                        theme.palette.mode === "light"
                          ? "0 12px 28px rgba(15,23,42,0.08)"
                          : "0 16px 40px rgba(0,0,0,0.35)",
                    },
                  }}
                >
                  <Stack direction="row" spacing={1.2} alignItems="center">
                    {card.icon}
                    <Box sx={{ minWidth: 0 }}>
                      <Typography fontWeight={900}>{card.label}</Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {loading
                          ? t("common.loading", { defaultValue: "Loading..." })
                          : user?.username ||
                            t("common.noData", { defaultValue: "No data yet" })}
                      </Typography>
                    </Box>
                  </Stack>

                  <Typography variant="h5" fontWeight={900} mt={2}>
                    {loading ? (
                      <Skeleton width={110} />
                    ) : leader ? (
                      getMetricLabel(card.key, score, t)
                    ) : (
                      "-"
                    )}
                  </Typography>
                </Paper>
              </Grid>
            );
          })}
        </Grid>

        <Paper
          sx={{
            p: 2,
            borderRadius: 4,
            border: "1px solid",
            borderColor: theme.customColors.sidebarBorder,
          }}
        >
          <Stack
            direction={{ xs: "column", lg: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", lg: "center" }}
            spacing={2}
          >
            <Stack spacing={0.5}>
              <Typography variant="h5" fontWeight={900}>
                {t(`metrics.${metric}`, {
                  defaultValue:
                    metric === "xp"
                      ? "XP"
                      : metric === "streak"
                        ? "Streak"
                        : "Words learned",
                })}
              </Typography>
              <Typography color="text.secondary">
                {t(`descriptions.${metric}`, {
                  defaultValue:
                    metric === "xp"
                      ? "See who has accumulated the most XP."
                      : metric === "streak"
                        ? "See who keeps the longest active streak."
                        : "See who has learned the most words.",
                })}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <ToggleButtonGroup
                exclusive
                value={metric}
                onChange={(_, nextMetric: LeaderboardMetric | null) => {
                  if (nextMetric) setMetric(nextMetric);
                }}
                size="small"
              >
                <ToggleButton value="xp">
                  {t("metrics.xp", { defaultValue: "XP" })}
                </ToggleButton>
                <ToggleButton value="streak">
                  {t("metrics.streak", { defaultValue: "Streak" })}
                </ToggleButton>
                <ToggleButton value="word">
                  {t("metrics.word", { defaultValue: "Words learned" })}
                </ToggleButton>
              </ToggleButtonGroup>

              <ToggleButtonGroup
                exclusive
                value={limit}
                onChange={(_, nextLimit: number | null) => {
                  if (nextLimit) {
                    void fetchAll(nextLimit);
                  }
                }}
                size="small"
              >
                {LIMIT_OPTIONS.map((value) => (
                  <ToggleButton key={value} value={value}>
                    {t("page.topLimit", {
                      defaultValue: "Top {{count}}",
                      count: value,
                    })}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Stack>
          </Stack>
        </Paper>

        <Grid container spacing={2}>
          {loading
            ? Array.from({ length: 3 }).map((_, index) => (
                <Grid key={index} size={{ xs: 12, md: 4 }}>
                  <Skeleton variant="rounded" height={220} />
                </Grid>
              ))
            : podiumItems.map((item) => (
                <Grid key={`${metric}-${item.rank}-${item.title}`} size={{ xs: 12, md: 4 }}>
                  <Paper
                    sx={{
                      height: "100%",
                      p: 2.2,
                      borderRadius: 4,
                      border: "1px solid",
                      borderColor:
                        item.rank === 1
                          ? alpha("#f59e0b", 0.65)
                          : item.rank === 2
                            ? alpha("#94a3b8", 0.6)
                            : alpha("#c2410c", 0.58),
                      backgroundImage:
                        item.rank === 1 ? theme.gradients.cardSoft : "none",
                    }}
                  >
                    <Stack spacing={1.4}>
                      <Stack direction="row" justifyContent="space-between">
                        <Chip
                          icon={<MilitaryTechRoundedIcon />}
                          label={t("podium.rank", {
                            defaultValue: "Rank #{{rank}}",
                            rank: item.rank,
                          })}
                          color={
                            item.rank === 1
                              ? "warning"
                              : item.rank === 2
                                ? "default"
                                : "secondary"
                          }
                        />
                        {item.isCurrentUser ? (
                          <Chip
                            label={t("labels.you", { defaultValue: "You" })}
                            color="primary"
                            variant="outlined"
                          />
                        ) : null}
                      </Stack>

                      <Stack direction="row" spacing={1.2} alignItems="center">
                        <Avatar
                          src={item.avatar}
                          sx={{
                            width: 58,
                            height: 58,
                            fontWeight: 800,
                            backgroundColor: alpha(getMetricColor(metric), 0.15),
                            color: getMetricColor(metric),
                          }}
                        >
                          {item.title.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="h6" fontWeight={900} noWrap>
                            {item.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {item.subtitle}
                          </Typography>
                        </Box>
                      </Stack>

                      <Typography variant="h4" fontWeight={900}>
                        {item.value}
                      </Typography>

                      {item.extra}
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
              {t("sections.ranking", { defaultValue: "Ranking" })}
            </Typography>

            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} variant="rounded" height={86} />
              ))
            ) : selectedItems.length === 0 ? (
              <Typography color="text.secondary">
                {t("empty.noResults", {
                  defaultValue: "No leaderboard results yet.",
                })}
              </Typography>
            ) : (
              <Stack spacing={1.2}>
                {selectedItems.map((entry, index) => {
                  const user = getEntryUser(entry);
                  const isCurrent =
                    Number(user?.id ?? (isProfileEntry(entry) ? entry.userId : 0)) ===
                    Number(currentUserId);
                  const score = getMetricValue(entry, metric);

                  return (
                    <Paper
                      key={`${metric}-${user?.id ?? "unknown"}-${index}`}
                      variant="outlined"
                      sx={{
                        p: 1.6,
                        borderRadius: 3,
                        borderColor: isCurrent
                          ? alpha(getMetricColor(metric), 0.65)
                          : undefined,
                        backgroundColor: isCurrent
                          ? alpha(getMetricColor(metric), 0.06)
                          : "transparent",
                      }}
                    >
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={1.5}
                        alignItems={{ xs: "flex-start", sm: "center" }}
                        justifyContent="space-between"
                      >
                        <Stack direction="row" spacing={1.2} alignItems="center">
                          <Box
                            sx={{
                              width: 34,
                              height: 34,
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 900,
                              backgroundColor: alpha(getMetricColor(metric), 0.12),
                              color: getMetricColor(metric),
                              flexShrink: 0,
                            }}
                          >
                            {index + 1}
                          </Box>

                          <Avatar src={user?.avatar || undefined}>
                            {(user?.username || "?").charAt(0).toUpperCase()}
                          </Avatar>

                          <Box sx={{ minWidth: 0 }}>
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                              flexWrap="wrap"
                              useFlexGap
                            >
                              <Typography fontWeight={900} noWrap>
                                {user?.username ||
                                  t("labels.unknownUser", {
                                    defaultValue: "Unknown user",
                                  })}
                              </Typography>
                              {isCurrent ? (
                                <Chip
                                  size="small"
                                  label={t("labels.you", { defaultValue: "You" })}
                                  color="primary"
                                  variant="outlined"
                                />
                              ) : null}
                            </Stack>

                            <Stack
                              direction="row"
                              spacing={1}
                              flexWrap="wrap"
                              useFlexGap
                              sx={{ mt: 0.45 }}
                            >
                              <Chip
                                size="small"
                                icon={getMetricIcon(metric)}
                                label={getMetricLabel(metric, score, t)}
                                variant="outlined"
                              />
                              <Chip
                                size="small"
                                icon={<SchoolRoundedIcon />}
                                label={t("labels.level", {
                                  defaultValue: "Level {{count}}",
                                  count: user?.progress?.level ?? 0,
                                })}
                                variant="outlined"
                              />
                              {metric === "word" && isProfileEntry(entry) ? (
                                <Chip
                                  size="small"
                                  icon={<AutoAwesomeRoundedIcon />}
                                  label={t("labels.lessonsCompleted", {
                                    defaultValue: "{{count}} lessons completed",
                                    count: entry.lessonsCompleted,
                                  })}
                                  variant="outlined"
                                />
                              ) : null}
                            </Stack>
                          </Box>
                        </Stack>

                        {metric === "word" && isProfileEntry(entry) ? (
                          <Stack
                            direction="row"
                            spacing={0.75}
                            flexWrap="wrap"
                            useFlexGap
                            sx={{ maxWidth: 360 }}
                          >
                            {entry.pinnedAchievements.slice(0, 3).map((achievement) => (
                              <Chip
                                key={`${achievement.id}-${achievement.name}`}
                                size="small"
                                label={achievement.name}
                              />
                            ))}
                          </Stack>
                        ) : (
                          <Typography variant="h6" fontWeight={900}>
                            {getMetricLabel(metric, score, t)}
                          </Typography>
                        )}
                      </Stack>
                    </Paper>
                  );
                })}
              </Stack>
            )}
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
};

export default LeaderboardPage;
