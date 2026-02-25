import React, { useEffect, useMemo } from "react";
import {
  Box,
  Button,
  Chip,
  LinearProgress,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLessonsStore } from "@/features/lessons/store/useLessonsStore";
import type { LessonStatus } from "@/features/lessons/model/types";

type StatusKey = "all" | "available" | "passed" | "locked";

function normalizeStatus(s?: LessonStatus): StatusKey {
  const v = String(s ?? "").toLowerCase();
  if (v === "passed") return "passed";
  if (v === "locked") return "locked";
  return "available";
}

function statusRank(s: StatusKey) {
  // Passed -> Available -> Locked
  if (s === "passed") return 0;
  if (s === "available") return 1;
  return 2;
}

const LessonsPage: React.FC = () => {
  const theme = useTheme();
  const nav = useNavigate();
  const { t } = useTranslation("lessons");

  const items = useLessonsStore((s) => s.items);
  const loading = useLessonsStore((s) => s.loading);

  const [q, setQ] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<StatusKey>("all");

  useEffect(() => {
    useLessonsStore.getState().fetchAll();
  }, []);

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();

    const filtered = items.filter((x) => {
      const st = normalizeStatus(x.lessonStatus);
      if (statusFilter !== "all" && st !== statusFilter) return false;

      if (!query) return true;

      const hay =
        `${x.name} ${x.description ?? ""} ${x.author ?? ""}`.toLowerCase();
      return hay.includes(query);
    });

    // sort: Passed -> Available -> Locked, then requiredLevel asc
    return filtered.sort((a, b) => {
      const sa = normalizeStatus(a.lessonStatus);
      const sb = normalizeStatus(b.lessonStatus);

      const r = statusRank(sa) - statusRank(sb);
      if (r !== 0) return r;

      const la = Number(a.requiredLevel ?? 0);
      const lb = Number(b.requiredLevel ?? 0);
      if (la !== lb) return la - lb;

      return Number(a.ID ?? 0) - Number(b.ID ?? 0);
    });
  }, [items, q, statusFilter]);

  const statusLabel = (s: StatusKey) => t(`status.${s}`);

  const SkeletonRow = () => (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        border: "1px solid",
        borderColor: theme.customColors.sidebarBorder,
        backgroundColor: "background.paper",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        gap={2}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Skeleton variant="text" width="55%" height={26} />
          <Skeleton variant="text" width="45%" height={18} />
          <Skeleton
            variant="rounded"
            height={10}
            sx={{ mt: 1, maxWidth: 320 }}
          />
        </Box>
        <Skeleton
          variant="rounded"
          width={110}
          height={36}
          sx={{ borderRadius: 999 }}
        />
      </Stack>
    </Paper>
  );

  return (
    <Box>
      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems={{ xs: "stretch", md: "center" }}
        justifyContent="space-between"
        gap={2}
        mb={2}
      >
        <Box>
          <Typography variant="h5" fontWeight={800}>
            {t("page.title")}
          </Typography>
          <Typography color="text.secondary">{t("page.subtitle")}</Typography>
        </Box>

        <TextField
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("search.placeholder")}
          size="small"
          sx={{ minWidth: { xs: "100%", md: 320 } }}
        />
      </Stack>

      {/* Quick filters */}
      <Stack direction="row" gap={1} flexWrap="wrap" useFlexGap mb={2}>
        {(["all", "available", "passed", "locked"] as StatusKey[]).map((k) => {
          const active = statusFilter === k;
          return (
            <Chip
              key={k}
              clickable
              label={statusLabel(k)}
              onClick={() => setStatusFilter(k)}
              sx={{
                borderRadius: 999,
                fontWeight: 800,
                border: "1px solid",
                borderColor: theme.customColors.sidebarBorder,
                bgcolor: active
                  ? theme.palette.mode === "light"
                    ? "rgba(37,99,235,0.10)"
                    : "rgba(37,99,235,0.22)"
                  : theme.palette.mode === "light"
                    ? "rgba(255,255,255,0.6)"
                    : "rgba(15,23,42,0.45)",
              }}
            />
          );
        })}
      </Stack>

      <Paper
        sx={{
          p: 2,
          border: "1px solid",
          borderColor: theme.customColors.sidebarBorder,
          backgroundColor: "background.paper",
        }}
      >
        {loading ? (
          <Stack gap={1.2}>
            {Array.from({ length: 7 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </Stack>
        ) : rows.length === 0 ? (
          <Typography color="text.secondary">{t("page.empty")}</Typography>
        ) : (
          <Stack gap={1.2}>
            {rows.map((x) => {
              const status = normalizeStatus(x.lessonStatus);
              const locked = status === "locked";

              const best = x.bestResult?.result;
              const bestPass = x.bestResult?.pass;

              const progressValue =
                typeof best === "number"
                  ? Math.max(0, Math.min(100, best))
                  : null;

              const card = (
                <Paper
                  key={x.ID}
                  elevation={0}
                  onClick={() => {
                    if (locked || !x.ID) return;
                    nav(`/app/lessons/${x.ID}`);
                  }}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: theme.customColors.sidebarBorder,
                    backgroundImage: theme.gradients.cardSoft,
                    display: "flex",
                    alignItems: { xs: "flex-start", md: "center" },
                    justifyContent: "space-between",
                    gap: 2,
                    flexDirection: { xs: "column", md: "row" },
                    opacity: locked ? 0.78 : 1,
                    cursor: locked ? "not-allowed" : "pointer",
                    transition: "transform 120ms ease, box-shadow 120ms ease",
                    "&:hover": locked
                      ? {}
                      : {
                          transform: "translateY(-1px)",
                          boxShadow:
                            theme.palette.mode === "light"
                              ? "0 12px 30px rgba(15,23,42,0.10)"
                              : "0 16px 40px rgba(0,0,0,0.85)",
                        },
                  }}
                >
                  <Box sx={{ minWidth: 0, width: "100%" }}>
                    <Stack
                      direction="row"
                      gap={1}
                      alignItems="center"
                      flexWrap="wrap"
                      useFlexGap
                    >
                      <Typography fontWeight={900} noWrap>
                        {x.name}
                      </Typography>

                      <Chip
                        size="small"
                        label={statusLabel(status)}
                        sx={{
                          borderRadius: 999,
                          bgcolor:
                            status === "passed"
                              ? theme.palette.mode === "light"
                                ? "rgba(34,197,94,0.12)"
                                : "rgba(34,197,94,0.22)"
                              : status === "locked"
                                ? theme.palette.mode === "light"
                                  ? "rgba(148,163,184,0.25)"
                                  : "rgba(148,163,184,0.18)"
                                : theme.palette.mode === "light"
                                  ? "rgba(37,99,235,0.10)"
                                  : "rgba(37,99,235,0.20)",
                          border: "1px solid",
                          borderColor: theme.customColors.sidebarBorder,
                          fontWeight: 700,
                        }}
                      />

                      {typeof best === "number" && (
                        <Chip
                          size="small"
                          label={t("card.bestChip", {
                            score: best,
                            mark: bestPass ? " ✓" : "",
                          })}
                          sx={{
                            borderRadius: 999,
                            bgcolor:
                              theme.palette.mode === "light"
                                ? "rgba(147,51,234,0.10)"
                                : "rgba(147,51,234,0.18)",
                            border: "1px solid",
                            borderColor: theme.customColors.sidebarBorder,
                            fontWeight: 700,
                          }}
                        />
                      )}
                    </Stack>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.4 }}
                      noWrap
                    >
                      {t("card.meta", {
                        level: x.requiredLevel ?? 0,
                        xp: x.reward ?? 0,
                      })}
                    </Typography>

                    {progressValue !== null && (
                      <Box sx={{ mt: 1.2, maxWidth: 420 }}>
                        <LinearProgress
                          variant="determinate"
                          value={progressValue}
                          sx={{
                            height: 10,
                            borderRadius: 999,
                            backgroundColor:
                              theme.palette.mode === "light"
                                ? "rgba(226,232,240,0.9)"
                                : "rgba(31,41,55,0.95)",
                            "& .MuiLinearProgress-bar": {
                              borderRadius: 999,
                              backgroundImage:
                                "linear-gradient(90deg,#22c55e,#a3e635,#facc15)",
                            },
                          }}
                        />
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          mt={0.5}
                        >
                          <Typography variant="caption" color="text.secondary">
                            {t("card.progress")}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 700 }}
                          >
                            {progressValue}%
                          </Typography>
                        </Stack>
                      </Box>
                    )}
                  </Box>

                  <Button
                    variant="contained"
                    disabled={!x.ID || locked}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!x.ID || locked) return;
                      nav(`/app/lessons/${x.ID}`);
                    }}
                    sx={{
                      flexShrink: 0,
                      boxShadow: "0 10px 24px rgba(15,23,42,0.25)",
                      alignSelf: { xs: "flex-start", md: "center" },
                    }}
                  >
                    {locked ? t("actions.locked") : t("actions.open")}
                  </Button>
                </Paper>
              );

              if (locked) {
                return (
                  <Tooltip
                    key={x.ID}
                    title={t("tooltip.requiredLevel", {
                      level: x.requiredLevel ?? 0,
                    })}
                    placement="top"
                    arrow
                  >
                    <Box>{card}</Box>
                  </Tooltip>
                );
              }

              return card;
            })}
          </Stack>
        )}
      </Paper>
    </Box>
  );
};

export default LessonsPage;
