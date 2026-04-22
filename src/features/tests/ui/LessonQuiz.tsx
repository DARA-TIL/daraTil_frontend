import React, { useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  LinearProgress,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import type { Test } from "../model/types";
import { useLessonTestStore } from "../store/useLessonTestStore";
import { useUiStore } from "@/shared/store/useUiStore";
import { useTranslation } from "react-i18next";

const LessonQuiz: React.FC<{ lessonId: number; test: Test }> = ({
  lessonId,
  test,
}) => {
  const theme = useTheme();
  const { t } = useTranslation("tests");
  const showSnackbar = useUiStore((s) => s.showSnackbar);

  const answers = useLessonTestStore((s) => s.answers);
  const setAnswer = useLessonTestStore((s) => s.setAnswer);
  const submit = useLessonTestStore((s) => s.submit);
  const submitting = useLessonTestStore((s) => s.submitting);

  const questions = useMemo(() => test.questions ?? [], [test.questions]);
  const total = questions.length;

  const [step, setStep] = useState(0);

  const questionRefs = useRef<Record<number, HTMLElement | null>>({});
  const [highlightId, setHighlightId] = useState<number | null>(null);

  const answeredCount = useMemo(() => {
    return questions.reduce((acc, q) => (answers[q.id] ? acc + 1 : acc), 0);
  }, [questions, answers]);

  const progressPercent =
    total > 0 ? Math.round((answeredCount / total) * 100) : 0;

  const current = questions[step];

  const firstUnanswered = useMemo(() => {
    const q = questions.find((qq) => !answers[qq.id]);
    return q?.id ?? null;
  }, [questions, answers]);

  const scrollToQuestion = (qid: number) => {
    const el = questionRefs.current[qid];
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const onSubmit = async () => {
    if (firstUnanswered) {
      setHighlightId(firstUnanswered);
      scrollToQuestion(firstUnanswered);
      showSnackbar(t("quiz.validation.answerAll"), "warning");
      return;
    }

    setHighlightId(null);
    await submit(lessonId);
  };

  if (!current) {
    return <Typography color="text.secondary">{t("quiz.empty")}</Typography>;
  }

  const isLast = step === total - 1;
  const isFirst = step === 0;

  return (
    <Stack gap={2}>
      {/* Top progress */}
      <Paper
        elevation={0}
        sx={{
          p: 1.6,
          borderRadius: 4,
          border: "1px solid",
          borderColor: theme.customColors.sidebarBorder,
          backgroundColor:
            theme.palette.mode === "light"
              ? "rgba(255,255,255,0.85)"
              : "rgba(15,23,42,0.55)",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ md: "center" }}
          gap={1.5}
        >
          <Box>
            <Typography fontWeight={900}>
              {t("quiz.progress.question", { current: step + 1, total })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("quiz.progress.answered", { answered: answeredCount, total })}
            </Typography>
          </Box>

          <Box sx={{ minWidth: { md: 320 }, width: "100%" }}>
            <LinearProgress
              variant="determinate"
              value={progressPercent}
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
          </Box>
        </Stack>
      </Paper>

      {/* Current question card */}
      <Box
        ref={(el) => {
          questionRefs.current[current.id] = el as HTMLDivElement | null;
        }}
        sx={{
          p: 2,
          borderRadius: 4,
          border: "1px solid",
          borderColor:
            highlightId === current.id
              ? theme.palette.error.main
              : theme.customColors.sidebarBorder,
          backgroundColor:
            theme.palette.mode === "light"
              ? "rgba(255,255,255,0.85)"
              : "rgba(15,23,42,0.55)",
          boxShadow:
            highlightId === current.id
              ? "0 0 0 3px rgba(239,68,68,0.15)"
              : "none",
          transition: "all 120ms ease",
        }}
      >
        <Typography fontWeight={900} mb={1}>
          {step + 1}. {current.text}
        </Typography>

        <FormControl>
          <RadioGroup
            value={answers[current.id] ?? ""}
            onChange={(e) => {
              setHighlightId(null);
              setAnswer(current.id, Number(e.target.value));
            }}
          >
            {current.options.map((o) => (
              <FormControlLabel
                key={o.id}
                value={o.id}
                control={<Radio />}
                label={o.text}
              />
            ))}
          </RadioGroup>
        </FormControl>
      </Box>

      {/* Navigation */}
      <Stack direction="row" gap={1} justifyContent="space-between">
        <Button
          variant="outlined"
          disabled={isFirst || submitting}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
        >
          {t("quiz.actions.back")}
        </Button>

        <Stack direction="row" gap={1}>
          {!isLast ? (
            <Button
              variant="contained"
              disabled={submitting}
              onClick={() => setStep((s) => Math.min(total - 1, s + 1))}
              sx={{ boxShadow: "0 10px 24px rgba(15,23,42,0.25)" }}
            >
              {t("quiz.actions.next")}
            </Button>
          ) : (
            <Button
              type="button"
              variant="contained"
              disabled={submitting}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSubmit();
              }}
              sx={{ boxShadow: "0 10px 24px rgba(15,23,42,0.25)" }}
            >
              {t("quiz.actions.submit")}
            </Button>
          )}
        </Stack>
      </Stack>

      {/* Helper: jump to first unanswered */}
      {firstUnanswered && (
        <Button
          variant="text"
          disabled={submitting}
          onClick={() => {
            setHighlightId(firstUnanswered);
            scrollToQuestion(firstUnanswered);
          }}
          sx={{ alignSelf: "flex-start" }}
        >
          {t("quiz.actions.goToFirstUnanswered")}
        </Button>
      )}
    </Stack>
  );
};

export default LessonQuiz;
