import React, { useEffect, useMemo } from "react";
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useLessonsStore } from "@/features/lessons/store/useLessonsStore";
import LessonBlocksRenderer from "@/features/lessons/ui/LessonBlocksRenderer";
import LessonTestSection from "@/features/tests/ui/LessonTestSection";

function statusLabel(s?: string) {
  const v = String(s ?? "").toLowerCase();
  if (v === "passed") return "Passed";
  if (v === "locked") return "Locked";
  return "Available";
}

const LessonDetailsPage: React.FC = () => {
  const theme = useTheme();
  const nav = useNavigate();
  const { id } = useParams();

  const lessonId = useMemo(() => Number(id), [id]);

  const loading = useLessonsStore((s) => s.loading);
  const lesson = useLessonsStore((s) => s.selected);

  useEffect(() => {
    if (!lessonId || Number.isNaN(lessonId)) return;

    useLessonsStore.getState().fetchById(lessonId);

    return () => {
      useLessonsStore.getState().clearSelected();
    };
  }, [lessonId]);

  if (loading || !lesson) {
    return (
      <Box>
        <Typography variant="h5" fontWeight={800}>
          Lesson
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  const status = String(lesson.lessonStatus ?? "available").toLowerCase();
  const locked = status === "locked";

  const best = lesson.bestResult?.result;
  const bestPass = lesson.bestResult?.pass;

  const attempts = (lesson.results ?? [])
    .slice()
    .sort((a, b) => (b.id ?? 0) - (a.id ?? 0));

  return (
    <Box>
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
                label={`Best: ${best}%${bestPass ? " ✓" : ""}`}
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
            Required level {lesson.requiredLevel} - Reward {lesson.reward} XP
            {lesson.author ? ` - Author ${lesson.author}` : ""}
          </Typography>
        </Box>

        <Button variant="outlined" onClick={() => nav("/app/lessons")}>
          Back
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
            This lesson is locked
          </Typography>
          <Typography color="text.secondary">
            Your level is ниже требуемого. Required level:{" "}
            {lesson.requiredLevel}.
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.8 }}>
            Complete previous lessons or gain XP to unlock this content.
          </Typography>
        </Paper>
      )}

      {/* DESCRIPTION + RESULTS */}
      {!locked && (
        <Stack gap={2} sx={{ mt: 0 }}>
          <Paper
            sx={{
              p: 2.2,
              border: "1px solid",
              borderColor: theme.customColors.sidebarBorder,
              backgroundColor: "background.paper",
            }}
          >
            <Typography fontWeight={800} mb={0.75}>
              Description
            </Typography>
            <Typography color="text.secondary" sx={{ whiteSpace: "pre-wrap" }}>
              {lesson.description?.trim()
                ? lesson.description
                : "No description provided."}
            </Typography>
          </Paper>

          <Paper
            sx={{
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
                <Typography fontWeight={900}>Your attempts</Typography>
                <Typography variant="body2" color="text.secondary">
                  Results are shown as percentage score.
                </Typography>
              </Box>

              <Chip
                size="small"
                label={`${attempts.length} attempts`}
                sx={{
                  borderRadius: 999,
                  border: "1px solid",
                  borderColor: theme.customColors.sidebarBorder,
                  fontWeight: 700,
                  alignSelf: { xs: "flex-start", md: "center" },
                }}
              />
            </Stack>

            {attempts.length === 0 ? (
              <Typography color="text.secondary">
                No attempts yet. Pass the test to finish the lesson.
              </Typography>
            ) : (
              <Stack gap={1}>
                {attempts.slice(0, 10).map((r) => (
                  <Paper
                    key={r.id}
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
                        Attempt #{r.id}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Score: {r.result}% {r.pass ? " - passed" : " - failed"}
                      </Typography>
                    </Box>

                    <Chip
                      size="small"
                      label={r.pass ? "PASS" : "FAIL"}
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
                ))}
              </Stack>
            )}
          </Paper>
        </Stack>
      )}

      {/* BLOCKS + TEST */}
      {!locked && (
        <Box sx={{ mt: 2 }}>
          <Typography fontWeight={900} mb={1}>
            Lesson blocks
          </Typography>

          <LessonBlocksRenderer blocks={lesson.blocks ?? []} />
          <LessonTestSection
            lessonId={lesson.ID}
            status={lesson.lessonStatus}
          />
        </Box>
      )}
    </Box>
  );
};

export default LessonDetailsPage;
