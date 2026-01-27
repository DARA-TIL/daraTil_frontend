import React, { useEffect, useMemo } from "react";
import { Box, Button, Paper, Stack, Typography, useTheme } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useLessonsStore } from "@/features/lessons/store/useLessonsStore";
import LessonBlocksRenderer from "@/features/lessons/ui/LessonBlocksRenderer";

const LessonDetailsPage: React.FC = () => {
  const theme = useTheme();
  const nav = useNavigate();
  const { id } = useParams();

  const lessonId = useMemo(() => Number(id), [id]);

  const loading = useLessonsStore((s) => s.loading);
  const lesson = useLessonsStore((s) => s.selected);

  useEffect(() => {
    if (!lessonId || Number.isNaN(lessonId)) return;

    // ВАЖНО: дергаем напрямую из стора - гарантированно будет вызываться
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
          <Typography variant="h5" fontWeight={900} noWrap>
            {lesson.name}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.4 }}>
            Level {lesson.requiredLevel} - Reward {lesson.reward} XP - Author{" "}
            {lesson.author}
          </Typography>
        </Box>

        <Button variant="outlined" onClick={() => nav("/app/lessons")}>
          Back
        </Button>
      </Stack>

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
          {lesson.description}
        </Typography>
      </Paper>

      <Box sx={{ mt: 2 }}>
        <Typography fontWeight={900} mb={1}>
          Lesson blocks
        </Typography>

        <LessonBlocksRenderer blocks={lesson.blocks ?? []} />
      </Box>
    </Box>
  );
};

export default LessonDetailsPage;
