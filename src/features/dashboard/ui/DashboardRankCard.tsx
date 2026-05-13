import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import LeaderboardRoundedIcon from "@mui/icons-material/LeaderboardRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import TranslateRoundedIcon from "@mui/icons-material/TranslateRounded";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import LeaderboardService from "@/features/leaderboard/api/LeaderboardService";
import type { LeaderboardProfileEntry } from "@/features/leaderboard/model/types";
import type { IUser } from "@/features/auth/model/IUser";
import { getApiErrorMessage } from "@/shared/lib/getApiErrorMessage";
import { useUiStore } from "@/shared/store/useUiStore";

type RankMetric = "xp" | "streak" | "word";

type RankState = Record<RankMetric, number | null>;

const DASHBOARD_RANK_LIMIT = 15;

function isProfileEntry(
  entry: IUser | LeaderboardProfileEntry,
): entry is LeaderboardProfileEntry {
  return "wordsLearned" in entry;
}

function getUserId(entry: IUser | LeaderboardProfileEntry): number {
  if (isProfileEntry(entry)) {
    return Number(entry.user?.id ?? entry.userId ?? 0);
  }

  return Number(entry.id ?? 0);
}

function findRank(
  entries: Array<IUser | LeaderboardProfileEntry>,
  currentUserId: number,
): number | null {
  const index = entries.findIndex((entry) => getUserId(entry) === currentUserId);
  return index >= 0 ? index + 1 : null;
}

export const DashboardRankCard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation("dashboard");
  const currentUserId = useAuthStore((state) => Number(state.user?.id ?? 0));
  const showSnackbar = useUiStore((state) => state.showSnackbar);

  const [loading, setLoading] = useState(false);
  const [ranks, setRanks] = useState<RankState>({
    xp: null,
    streak: null,
    word: null,
  });

  useEffect(() => {
    if (!currentUserId) return;

    let isMounted = true;

    const loadRanks = async () => {
      setLoading(true);

      try {
        const [xpItems, streakItems, wordItems] = await Promise.all([
          LeaderboardService.getUsers("xp", DASHBOARD_RANK_LIMIT),
          LeaderboardService.getUsers("streak", DASHBOARD_RANK_LIMIT),
          LeaderboardService.getProfiles("word", DASHBOARD_RANK_LIMIT),
        ]);

        if (!isMounted) return;

        setRanks({
          xp: findRank(xpItems, currentUserId),
          streak: findRank(streakItems, currentUserId),
          word: findRank(wordItems, currentUserId),
        });
      } catch (error) {
        if (!isMounted) return;

        showSnackbar(
          getApiErrorMessage(error) ??
            t("cards.rankLoadError", {
              defaultValue: "Failed to load your rank summary.",
            }),
          "error",
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadRanks();

    return () => {
      isMounted = false;
    };
  }, [currentUserId, showSnackbar, t]);

  const metricCards = useMemo(
    () => [
      {
        key: "xp" as const,
        label: t("cards.rankMetricXp", { defaultValue: "XP" }),
        icon: <BoltRoundedIcon sx={{ color: "#2563eb" }} />,
        color: "#2563eb",
      },
      {
        key: "streak" as const,
        label: t("cards.rankMetricStreak", { defaultValue: "Streak" }),
        icon: <LocalFireDepartmentRoundedIcon sx={{ color: "#f97316" }} />,
        color: "#f97316",
      },
      {
        key: "word" as const,
        label: t("cards.rankMetricWords", { defaultValue: "Words" }),
        icon: <TranslateRoundedIcon sx={{ color: "#16a34a" }} />,
        color: "#16a34a",
      },
    ],
    [t],
  );

  const bestRank = useMemo(() => {
    const values = Object.values(ranks).filter(
      (value): value is number => typeof value === "number" && value > 0,
    );

    if (values.length === 0) return null;
    return Math.min(...values);
  }, [ranks]);

  const formatRank = (rank: number | null) => {
    if (rank) {
      return t("cards.rankExact", {
        defaultValue: "#{{rank}}",
        rank,
      });
    }

    return t("cards.rankOutsideTop", {
      defaultValue: "Top {{count}}+",
      count: DASHBOARD_RANK_LIMIT,
    });
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 4,
        p: 2.4,
        position: "relative",
        overflow: "hidden",
        background:
          theme.palette.mode === "light"
            ? "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(244,247,255,0.98))"
            : "linear-gradient(145deg, rgba(15,23,42,0.96), rgba(30,41,59,0.92))",
        border: `1px solid ${
          theme.palette.mode === "light"
            ? "rgba(148,163,184,0.28)"
            : "rgba(99,102,241,0.16)"
        }`,
        boxShadow:
          theme.palette.mode === "light"
            ? "0 16px 36px rgba(15,23,42,0.08)"
            : "0 18px 40px rgba(2,6,23,0.42)",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: -34,
          right: -28,
          width: 120,
          height: 120,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 30% 30%, rgba(37,99,235,0.18), transparent 64%)",
          pointerEvents: "none",
        }}
      />

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        spacing={2}
        sx={{ position: "relative", zIndex: 1 }}
      >
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" mb={0.8}>
            <LeaderboardRoundedIcon color="primary" />
            <Typography variant="h6" fontWeight={800}>
              {t("cards.rankTitle", {
                defaultValue: "Your rank",
              })}
            </Typography>
          </Stack>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ maxWidth: 420 }}
          >
            {t("cards.rankSubtitle", {
              defaultValue:
                "A quick snapshot of where you stand across the main leaderboard metrics.",
            })}
          </Typography>
        </Box>

        <Box
          sx={{
            px: 1.2,
            py: 0.9,
            borderRadius: 3,
            minWidth: 88,
            textAlign: "center",
            backgroundColor:
              theme.palette.mode === "light"
                ? alpha("#2563eb", 0.08)
                : alpha("#38bdf8", 0.1),
            border: `1px solid ${alpha("#60a5fa", 0.2)}`,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {t("cards.rankBestLabel", {
              defaultValue: "Best",
            })}
          </Typography>
          <Typography fontWeight={900} fontSize={22} lineHeight={1.1}>
            {loading ? "..." : formatRank(bestRank)}
          </Typography>
        </Box>
      </Stack>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.2}
        mt={2}
        sx={{ position: "relative", zIndex: 1 }}
      >
        {metricCards.map((metric) => (
          <Box
            key={metric.key}
            sx={{
              flex: 1,
              minWidth: 0,
              px: 1.4,
              py: 1.3,
              borderRadius: 3,
              backgroundColor:
                theme.palette.mode === "light"
                  ? alpha("#ffffff", 0.7)
                  : alpha("#0f172a", 0.5),
              border: `1px solid ${alpha(metric.color, 0.16)}`,
            }}
          >
            <Stack direction="row" spacing={0.9} alignItems="center" mb={0.8}>
              {metric.icon}
              <Typography variant="body2" fontWeight={700}>
                {metric.label}
              </Typography>
            </Stack>

            {loading ? (
              <Skeleton width={72} height={34} />
            ) : (
              <Typography
                sx={{
                  fontSize: 28,
                  lineHeight: 1.05,
                  fontWeight: 900,
                  color: metric.color,
                }}
              >
                {formatRank(ranks[metric.key])}
              </Typography>
            )}
          </Box>
        ))}
      </Stack>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={1.2}
        mt={2}
        sx={{ position: "relative", zIndex: 1 }}
      >
        <Typography variant="caption" color="text.secondary">
          {t("cards.rankLimitHint", {
            defaultValue: "Based on the current top {{count}} leaderboard entries.",
            count: DASHBOARD_RANK_LIMIT,
          })}
        </Typography>

        <Button
          variant="outlined"
          size="small"
          endIcon={<ArrowOutwardRoundedIcon />}
          onClick={() => navigate("/app/leaderboard")}
          sx={{
            alignSelf: { xs: "stretch", sm: "center" },
            borderRadius: 999,
            px: 2,
            fontWeight: 700,
          }}
        >
          {t("cards.rankAction", {
            defaultValue: "Open leaderboard",
          })}
        </Button>
      </Stack>
    </Paper>
  );
};
