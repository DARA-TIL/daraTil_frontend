import React from "react";
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from "@mui/material";
import type { Test } from "../model/types";
import { useLessonTestStore } from "../store/useLessonTestStore";

const LessonQuiz: React.FC<{ lessonId: number; test: Test }> = ({
  lessonId,
  test,
}) => {
  const answers = useLessonTestStore((s) => s.answers);
  const setAnswer = useLessonTestStore((s) => s.setAnswer);
  const submit = useLessonTestStore((s) => s.submit);
  const submitting = useLessonTestStore((s) => s.submitting);

  return (
    <Stack gap={2}>
      {test.questions.map((q, idx) => (
        <Box key={q.id}>
          <Typography fontWeight={900}>
            {idx + 1}. {q.text}
          </Typography>

          <FormControl sx={{ mt: 1 }}>
            <RadioGroup
              value={answers[q.id] ?? ""}
              onChange={(e) => setAnswer(q.id, Number(e.target.value))}
            >
              {q.options.map((o) => (
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
      ))}

      <Button
        variant="contained"
        disabled={submitting}
        onClick={() => submit(lessonId)}
      >
        Submit answers
      </Button>
    </Stack>
  );
};

export default LessonQuiz;
