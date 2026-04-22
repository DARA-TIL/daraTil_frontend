import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLessonsStore } from "@/features/lessons/store/useLessonsStore";
import LessonBlocksRenderer from "@/features/lessons/ui/LessonBlocksRenderer";
import LessonTestSection from "@/features/tests/ui/LessonTestSection";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

const LessonDetailsPage: React.FC = () => {
  const theme = useTheme();
  const nav = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation("lessons");

  const lessonId = useMemo(() => Number(id), [id]);

  const loading = useLessonsStore((s) => s.loading);
  const lesson = useLessonsStore((s) => s.selected);

  const me = useAuthStore((s) => s.user);
  const [showAllAttempts, setShowAllAttempts] = useState(false);

  useEffect(() => {
    if (!lessonId || Number.isNaN(lessonId)) return;

    useLessonsStore.getState().fetchById(lessonId);

    return () => {
      useLessonsStore.getState().clearSelected();
      setShowAllAttempts(false);
    };
  }, [lessonId]);

  const results = useMemo(() => lesson?.results ?? [], [lesson?.results]);

  const computedBest = useMemo(() => {
    if (!results.length) return null;

    const bestOne = results.reduce((a, b) =>
      Number(b.result ?? 0) > Number(a.result ?? 0) ? b : a,
    );

    return {
      result: Number(bestOne.result ?? 0),
      pass: Boolean(bestOne.pass),
    };
  }, [results]);

  const best = lesson?.bestResult?.result ?? computedBest?.result;
  const bestPass = lesson?.bestResult?.pass ?? computedBest?.pass;

  const statusLabel = (s?: string) => {
    const v = String(s ?? "").toLowerCase();
    if (v === "passed") return t("status.passed");
    if (v === "locked") return t("status.locked");
    return t("status.available");
  };

  if (loading || !lesson) {
    return (
      <Box>
        <Typography variant="h5" fontWeight={800}>
          {t("details.loadingTitle")}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          {t("common.loading")}
        </Typography>
      </Box>
    );
  }

  const status = String(lesson.lessonStatus ?? "available").toLowerCase();
  const locked = status === "locked";

  const attemptsSorted = (lesson.results ?? [])
    .slice()
    .sort((a, b) => Number(b.id ?? 0) - Number(a.id ?? 0));

  const attemptsPreviewCount = 3;
  const attemptsPreview = attemptsSorted.slice(0, attemptsPreviewCount);
  const attemptsHiddenCount = Math.max(
    0,
    attemptsSorted.length - attemptsPreview.length,
  );

  const myLevel = me?.progress?.level ?? 0;

  return (
    <Box>
      {/* Header */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems={{ xs: "stretch", md: "center" }}
        justifyContent="space-between"
        gap={2}
        mb={2}
      >
        <Box sx={{ minWidth: 0 }}>
          <Stack
            direction="row"
            gap={1}
            alignItems="center"
            flexWrap="wrap"
            useFlexGap
          >
            <Typography variant="h5" fontWeight={900} noWrap>
              {lesson.name}
            </Typography>

            <Chip
              size="small"
              label={statusLabel(lesson.lessonStatus)}
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

          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            {t("details.meta", {
              level: lesson.requiredLevel ?? 0,
              xp: lesson.reward ?? 0,
              author: lesson.author ?? "",
              hasAuthor: Boolean(lesson.author),
            })}
          </Typography>
        </Box>

        <Button variant="outlined" onClick={() => nav("/app/lessons")}>
          {t("common.back")}
        </Button>
      </Stack>

      {/* LOCKED STATE */}
      {locked && (
        <Paper
          sx={{
            p: 2.2,
            border: "1px solid",
            borderColor: theme.customColors.sidebarBorder,
            backgroundImage: theme.gradients.cardSoft,
          }}
        >
          <Typography fontWeight={900} mb={0.5}>
            {t("locked.title")}
          </Typography>
          <Typography color="text.secondary">
            {t("locked.levels", {
              myLevel,
              requiredLevel: lesson.requiredLevel ?? 0,
            })}
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 0.8 }}>
            {t("locked.hint")}
          </Typography>

          <Stack
            direction="row"
            gap={1}
            sx={{ mt: 1.6 }}
            flexWrap="wrap"
            useFlexGap
          >
            <Button
              variant="contained"
              onClick={() => nav("/app/lessons")}
              sx={{ boxShadow: "0 10px 24px rgba(15,23,42,0.25)" }}
            >
              {t("locked.goToLessons")}
            </Button>
            <Button variant="outlined" onClick={() => nav("/app/lessons")}>
              {t("locked.viewAvailable")}
            </Button>
          </Stack>
        </Paper>
      )}

      {/* CONTENT */}
      {!locked && (
        <Stack gap={2}>
          {/* Description */}
          <Paper
            sx={{
              p: 2.2,
              border: "1px solid",
              borderColor: theme.customColors.sidebarBorder,
              backgroundColor: "background.paper",
            }}
          >
            <Typography fontWeight={800} mb={0.75}>
              {t("description.title")}
            </Typography>
            <Typography color="text.secondary" sx={{ whiteSpace: "pre-wrap" }}>
              {lesson.description?.trim()
                ? lesson.description
                : t("description.empty")}
            </Typography>
          </Paper>

          <Divider sx={{ borderColor: theme.customColors.sidebarBorder }} />

          {/* Results + Best result */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            gap={2}
            alignItems="stretch"
          >
            {/* Attempts */}
            <Paper
              sx={{
                flex: 1,
                p: 2.2,
                border: "1px solid",
                borderColor: theme.customColors.sidebarBorder,
                backgroundColor: "background.paper",
              }}
            >
              <Stack
                direction={{ xs: "column", md: "row" }}
                alignItems={{ xs: "stretch", md: "center" }}
                justifyContent="space-between"
                gap={2}
                mb={1}
              >
                <Box>
                  <Typography fontWeight={900}>
                    {t("attempts.title")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t("attempts.subtitle")}
                  </Typography>
                </Box>

                <Stack
                  direction="row"
                  gap={1}
                  alignItems="center"
                  justifyContent="flex-end"
                >
                  <Chip
                    size="small"
                    label={t("attempts.total", {
                      count: attemptsSorted.length,
                    })}
                    sx={{
                      borderRadius: 999,
                      border: "1px solid",
                      borderColor: theme.customColors.sidebarBorder,
                      fontWeight: 700,
                    }}
                  />

                  {attemptsSorted.length > attemptsPreviewCount && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => setShowAllAttempts((v) => !v)}
                      sx={{ borderRadius: 999 }}
                    >
                      {showAllAttempts
                        ? t("attempts.hide")
                        : t("attempts.showAll")}
                    </Button>
                  )}
                </Stack>
              </Stack>

              {attemptsSorted.length === 0 ? (
                <Typography color="text.secondary">
                  {t("attempts.empty")}
                </Typography>
              ) : (
                <Stack gap={1}>
                  {(showAllAttempts ? attemptsSorted : attemptsPreview).map(
                    (r, idx) => (
                      <Paper
                        key={`${r.id}-${idx}`}
                        elevation={0}
                        sx={{
                          p: 1.4,
                          borderRadius: 3,
                          border: "1px solid",
                          borderColor: theme.customColors.sidebarBorder,
                          backgroundColor:
                            theme.palette.mode === "light"
                              ? "rgba(255,255,255,0.85)"
                              : "rgba(15,23,42,0.55)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 2,
                        }}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography fontWeight={900} noWrap>
                            {t("attempts.attempt", { n: idx + 1 })}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {t("attempts.scoreLine", {
                              score: r.result ?? 0,
                              status: r.pass
                                ? t("attempts.passed")
                                : t("attempts.failed"),
                            })}
                          </Typography>
                        </Box>

                        <Chip
                          size="small"
                          label={
                            r.pass
                              ? t("attempts.passChip")
                              : t("attempts.failChip")
                          }
                          sx={{
                            borderRadius: 999,
                            fontWeight: 900,
                            bgcolor: r.pass
                              ? theme.palette.mode === "light"
                                ? "rgba(34,197,94,0.12)"
                                : "rgba(34,197,94,0.22)"
                              : theme.palette.mode === "light"
                                ? "rgba(239,68,68,0.10)"
                                : "rgba(239,68,68,0.20)",
                            border: "1px solid",
                            borderColor: theme.customColors.sidebarBorder,
                          }}
                        />
                      </Paper>
                    ),
                  )}

                  {!showAllAttempts && attemptsHiddenCount > 0 && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      {t("attempts.hiddenMore", { count: attemptsHiddenCount })}
                    </Typography>
                  )}
                </Stack>
              )}
            </Paper>

            {/* Best result card */}
            <Paper
              sx={{
                width: { xs: "100%", md: 360 },
                p: 2.2,
                border: "1px solid",
                borderColor: theme.customColors.sidebarBorder,
                backgroundImage: theme.gradients.cardSoft,
              }}
            >
              <Typography fontWeight={900} mb={0.5}>
                {t("best.title")}
              </Typography>

              {typeof best === "number" ? (
                <>
                  <Typography color="text.secondary">
                    {t("best.scoreLabel")} <b>{best}%</b>
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.3 }}>
                    {t("best.statusLabel")}{" "}
                    {bestPass ? t("best.passed") : t("best.failed")}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 1 }}>
                    {t("best.tip")}
                  </Typography>
                </>
              ) : (
                <Typography color="text.secondary">
                  {t("best.empty")}
                </Typography>
              )}
            </Paper>
          </Stack>

          <Divider sx={{ borderColor: theme.customColors.sidebarBorder }} />

          {/* Blocks */}
          <Box>
            <Typography fontWeight={900} mb={1}>
              {t("blocks.title")}
            </Typography>
            <LessonBlocksRenderer blocks={lesson.blocks ?? []} />
          </Box>

          <Divider sx={{ borderColor: theme.customColors.sidebarBorder }} />

          {/* Test */}
          <Box>
            <Typography fontWeight={900} mb={1}>
              {t("test.title")}
            </Typography>

            <LessonTestSection
              lessonId={lesson.ID}
              status={lesson.lessonStatus}
            />
          </Box>
        </Stack>
      )}
    </Box>
  );
};

export default LessonDetailsPage;
