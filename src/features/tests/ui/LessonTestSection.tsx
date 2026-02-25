import React, { useEffect } from "react";
import { Box, Button, Paper, Stack, Typography, useTheme } from "@mui/material";
import { useLessonTestStore } from "../store/useLessonTestStore";
import LessonQuiz from "./LessonQuiz";
import LessonFinishResultCard from "./LessonFinishResultCard";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const LessonTestSection: React.FC<{ lessonId: number; status?: string }> = ({
  lessonId,
  status,
}) => {
  const theme = useTheme();
  const nav = useNavigate();
  const { t } = useTranslation("tests");

  const { test, loading, started, finishResult, fetchByLesson, start, reset } =
    useLessonTestStore();

  useEffect(() => {
    if (!lessonId) return;

    fetchByLesson(lessonId);

    return () => {
      reset();
    };
  }, [lessonId, fetchByLesson, reset]);

  if (status === "locked") return null;

  const pass = Boolean(finishResult?.data?.pass);

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
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ md: "center" }}
        gap={2}
        mb={1.5}
      >
        <Box>
          <Typography fontWeight={900}>{t("section.title")}</Typography>
          <Typography variant="body2" color="text.secondary">
            {t("section.subtitle")}
          </Typography>
        </Box>

        <Stack direction="row" gap={1} flexWrap="wrap" useFlexGap>
          {!started ? (
            <Button
              variant="contained"
              disabled={loading || !test}
              onClick={start}
              sx={{ boxShadow: "0 10px 24px rgba(15,23,42,0.25)" }}
            >
              {t("actions.startTest")}
            </Button>
          ) : (
            <Button variant="outlined" onClick={reset}>
              {t("actions.reset")}
            </Button>
          )}

          {finishResult && (
            <>
              <Button variant="outlined" onClick={() => nav("/app/lessons")}>
                {t("actions.backToLessons")}
              </Button>

              <Button
                variant="contained"
                onClick={() => {
                  reset();
                  start();
                }}
                sx={{ boxShadow: "0 10px 24px rgba(15,23,42,0.25)" }}
              >
                {t("actions.retryImprove")}
              </Button>

              {!pass && (
                <Button
                  variant="text"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  {t("actions.reviewBlocks")}
                </Button>
              )}
            </>
          )}
        </Stack>
      </Stack>

      {!test && !loading && (
        <Typography color="text.secondary">{t("state.noTest")}</Typography>
      )}

      {loading && (
        <Typography color="text.secondary">{t("state.loadingTest")}</Typography>
      )}

      {finishResult && <LessonFinishResultCard res={finishResult} />}

      {test && started && !finishResult && (
        <LessonQuiz lessonId={lessonId} test={test} />
      )}
    </Paper>
  );
};

export default LessonTestSection;
