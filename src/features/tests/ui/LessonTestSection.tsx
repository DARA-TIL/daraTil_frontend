import React, { useEffect } from "react";
import { Box, Button, Paper, Stack, Typography, useTheme } from "@mui/material";
import { useLessonTestStore } from "../store/useLessonTestStore";
import LessonQuiz from "./LessonQuiz";
import LessonFinishResultCard from "./LessonFinishResultCard";

const LessonTestSection: React.FC<{ lessonId: number; status?: string }> = ({
  lessonId,
  status,
}) => {
  const theme = useTheme();
  const { test, loading, started, finishResult, fetchByLesson, start, reset } =
    useLessonTestStore();

  useEffect(() => {
    if (!lessonId) return;

    fetchByLesson(lessonId);

    return () => {
      // сбросить UI теста при уходе со страницы урока
      reset();
    };
  }, [lessonId, fetchByLesson, reset]);

  if (status === "locked") {
    return null;
  }

  return (
    <Paper
      elevation={0}
      sx={{
        mt: 2.5,
        p: 2.2,
        borderRadius: 4,
        border: "1px solid",
        borderColor: theme.customColors.sidebarBorder,
        backgroundImage: theme.gradients.cardSoft,
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        gap={2}
        mb={1.5}
      >
        <Box>
          <Typography fontWeight={900}>Lesson Test</Typography>
          <Typography variant="body2" color="text.secondary">
            Complete the quiz to finish the lesson.
          </Typography>
        </Box>

        <Stack direction="row" gap={1}>
          {!started ? (
            <Button
              variant="contained"
              disabled={loading || !test}
              onClick={start}
            >
              Start test
            </Button>
          ) : (
            <Button variant="outlined" onClick={reset}>
              Reset
            </Button>
          )}
        </Stack>
      </Stack>

      {!test && !loading && (
        <Typography color="text.secondary">
          No test attached to this lesson yet.
        </Typography>
      )}

      {loading && (
        <Typography color="text.secondary">Loading test...</Typography>
      )}

      {finishResult && <LessonFinishResultCard res={finishResult} />}

      {test && started && <LessonQuiz lessonId={lessonId} test={test} />}
    </Paper>
  );
};

export default LessonTestSection;
