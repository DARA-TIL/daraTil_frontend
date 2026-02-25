import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useTestAdminStore } from "../../store/useTestAdminStore";
import type { QuestionDto, QuestionOptionDto } from "../../model/types";

type Props = { lessonId: number };

const LessonTestAdminTab: React.FC<Props> = ({ lessonId }) => {
  const theme = useTheme();

  const test = useTestAdminStore((s) => s.test);
  const loading = useTestAdminStore((s) => s.loading);
  const draft = useTestAdminStore((s) => s.draft);

  const fetchByLesson = useTestAdminStore((s) => s.fetchByLesson);
  const createForLesson = useTestAdminStore((s) => s.createForLesson);
  const deleteTest = useTestAdminStore((s) => s.deleteTest);

  const addQuestion = useTestAdminStore((s) => s.addQuestion);
  const deleteQuestion = useTestAdminStore((s) => s.deleteQuestion);

  const addOption = useTestAdminStore((s) => s.addOption);
  const updateOption = useTestAdminStore((s) => s.updateOption);
  const deleteOption = useTestAdminStore((s) => s.deleteOption);

  const setDraftQuestionText = useTestAdminStore((s) => s.setDraftQuestionText);
  const setDraftOption = useTestAdminStore((s) => s.setDraftOption);
  const saveDraft = useTestAdminStore((s) => s.saveDraft);
  const clearDraft = useTestAdminStore((s) => s.clearDraft);

  useEffect(() => {
    if (!lessonId) return;
    fetchByLesson(lessonId);
  }, [lessonId, fetchByLesson]);

  const [newQuestionText, setNewQuestionText] = useState("");
  const hasDraft = Boolean(draft && draft.questionsUpd?.length);

  const totalQuestions = test?.questions?.length ?? 0;

  const correctCount = useMemo(() => {
    const q = test?.questions ?? [];
    let c = 0;
    q.forEach((qq) => {
      if (qq.options?.some((o) => o.isCorrect)) c += 1;
    });
    return c;
  }, [test?.questions]);

  if (!test) {
    return (
      <Box sx={{ p: 2.2 }}>
        <Stack gap={2}>
          <Box>
            <Typography fontWeight={900}>Lesson test</Typography>
            <Typography color="text.secondary">
              This lesson has no test yet. Create one to enable quiz at the end
              of the lesson.
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            disabled={loading}
            onClick={() => createForLesson(lessonId)}
            sx={{
              alignSelf: "flex-start",
              boxShadow: "0 10px 24px rgba(15,23,42,0.25)",
            }}
          >
            Create test
          </Button>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2.2 }}>
      <Stack gap={2}>
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 4,
            border: "1px solid",
            borderColor: theme.customColors.sidebarBorder,
            backgroundImage: theme.gradients.cardSoft,
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", md: "center" }}
            gap={2}
          >
            <Box>
              <Typography fontWeight={900}>Test #{test.id}</Typography>
              <Typography variant="body2" color="text.secondary">
                Questions: {totalQuestions} - With at least 1 correct option:{" "}
                {correctCount}
              </Typography>
            </Box>

            <Stack
              direction="row"
              gap={1}
              flexShrink={0}
              justifyContent="flex-end"
            >
              <Button
                variant="outlined"
                disabled={!hasDraft || loading}
                onClick={clearDraft}
              >
                Reset changes
              </Button>

              <Button
                variant="contained"
                startIcon={<SaveOutlinedIcon />}
                disabled={!hasDraft || loading}
                onClick={saveDraft}
                sx={{ boxShadow: "0 10px 24px rgba(15,23,42,0.25)" }}
              >
                Save all changes
              </Button>

              <Button
                variant="text"
                color="error"
                startIcon={<DeleteOutlineIcon />}
                disabled={loading}
                onClick={async () => {
                  const ok = window.confirm(
                    "Delete this test? This will remove all questions.",
                  );
                  if (!ok) return;
                  await deleteTest(test.id, lessonId);
                }}
              >
                Delete test
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* Add question */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 4,
            border: "1px solid",
            borderColor: theme.customColors.sidebarBorder,
            backgroundColor: "background.paper",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            gap={2}
            alignItems={{ xs: "stretch", md: "center" }}
          >
            <TextField
              label="New question"
              value={newQuestionText}
              onChange={(e) => setNewQuestionText(e.target.value)}
              fullWidth
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              disabled={loading || !newQuestionText.trim()}
              onClick={async () => {
                const txt = newQuestionText.trim();
                if (!txt) return;
                const ok = await addQuestion(lessonId, {
                  testId: test.id,
                  text: txt,
                });
                if (ok) setNewQuestionText("");
              }}
              sx={{ boxShadow: "0 10px 24px rgba(15,23,42,0.25)" }}
            >
              Add
            </Button>
          </Stack>
        </Paper>

        {/* Questions list */}
        <Stack gap={1.5}>
          {(test.questions ?? []).map((q) => (
            <QuestionCard
              key={q.id}
              lessonId={lessonId}
              q={q}
              loading={loading}
              onDelete={() => deleteQuestion(lessonId, q.id)}
              onDraftText={(text) => setDraftQuestionText(q.id, text)}
              onAddOption={(text, isCorrect) =>
                addOption(lessonId, { questionId: q.id, text, isCorrect })
              }
              onUpdateOption={(optId, text, isCorrect) =>
                updateOption(lessonId, { id: optId, text, isCorrect })
              }
              onDeleteOption={(optId) => deleteOption(lessonId, optId)}
              onDraftOption={(optId, patch) =>
                setDraftOption(q.id, optId, patch)
              }
              theme={theme}
            />
          ))}
        </Stack>
      </Stack>
    </Box>
  );
};

export default LessonTestAdminTab;

function QuestionCard(props: {
  lessonId: number;
  q: QuestionDto;
  loading: boolean;
  onDelete: () => Promise<boolean>;
  onDraftText: (text: string) => void;
  onAddOption: (text: string, isCorrect: boolean) => Promise<boolean>;
  onUpdateOption: (
    optId: number,
    text: string,
    isCorrect: boolean,
  ) => Promise<boolean>;
  onDeleteOption: (optId: number) => Promise<boolean>;
  onDraftOption: (
    optId: number,
    patch: { text?: string; isCorrect?: boolean },
  ) => void;
  theme: any;
}) {
  const {
    q,
    loading,
    onDelete,
    onDraftText,
    onAddOption,
    onUpdateOption,
    onDeleteOption,
    onDraftOption,
    theme,
  } = props;

  const [qText, setQText] = useState(q.text ?? "");
  useEffect(() => setQText(q.text ?? ""), [q.text]);

  const [newOptText, setNewOptText] = useState("");
  const [newOptCorrect, setNewOptCorrect] = useState(false);

  const hasCorrect = (q.options ?? []).some((o) => o.isCorrect);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 4,
        border: "1px solid",
        borderColor: theme.customColors.sidebarBorder,
        backgroundColor: "background.paper",
      }}
    >
      <Stack gap={1.5}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          gap={2}
          alignItems={{ xs: "stretch", md: "center" }}
          justifyContent="space-between"
        >
          <Box sx={{ minWidth: 0 }}>
            <Stack
              direction="row"
              gap={1}
              alignItems="center"
              flexWrap="wrap"
              useFlexGap
            >
              <Typography fontWeight={900} noWrap>
                Q#{q.id}
              </Typography>

              {hasCorrect ? (
                <Chip
                  size="small"
                  icon={<CheckCircleOutlineIcon />}
                  label="Has correct option"
                  sx={{
                    borderRadius: 999,
                    border: "1px solid",
                    borderColor: theme.customColors.sidebarBorder,
                    bgcolor:
                      theme.palette.mode === "light"
                        ? "rgba(34,197,94,0.10)"
                        : "rgba(34,197,94,0.18)",
                    fontWeight: 700,
                  }}
                />
              ) : (
                <Chip
                  size="small"
                  label="No correct option"
                  sx={{
                    borderRadius: 999,
                    border: "1px solid",
                    borderColor: theme.customColors.sidebarBorder,
                    bgcolor:
                      theme.palette.mode === "light"
                        ? "rgba(239,68,68,0.10)"
                        : "rgba(239,68,68,0.18)",
                    fontWeight: 700,
                  }}
                />
              )}
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Edit question text and options. Use "Save all changes" for bulk
              edits.
            </Typography>
          </Box>

          <Button
            variant="text"
            color="error"
            startIcon={<DeleteOutlineIcon />}
            disabled={loading}
            onClick={async () => {
              const ok = window.confirm(
                "Delete this question and all its options?",
              );
              if (!ok) return;
              await onDelete();
            }}
          >
            Delete question
          </Button>
        </Stack>

        <TextField
          label="Question text"
          value={qText}
          onChange={(e) => {
            const v = e.target.value;
            setQText(v);
            onDraftText(v);
          }}
          fullWidth
        />

        <Divider />

        <Typography fontWeight={900}>Options</Typography>

        <Stack gap={1}>
          {(q.options ?? []).map((o) => (
            <OptionRow
              key={o.id}
              opt={o}
              loading={loading}
              onSave={(text, isCorrect) =>
                onUpdateOption(o.id, text, isCorrect)
              }
              onDelete={() => onDeleteOption(o.id)}
              onDraft={(patch) => onDraftOption(o.id, patch)}
              theme={theme}
            />
          ))}
        </Stack>

        <Divider />

        {/* Add option */}
        <Stack direction={{ xs: "column", md: "row" }} gap={2}>
          <TextField
            label="New option"
            value={newOptText}
            onChange={(e) => setNewOptText(e.target.value)}
            fullWidth
          />
          <TextField
            label="isCorrect"
            value={newOptCorrect ? "true" : "false"}
            onChange={(e) => setNewOptCorrect(e.target.value === "true")}
            select
            sx={{ minWidth: { md: 180 } }}
          >
            <MenuItem value="false">false</MenuItem>
            <MenuItem value="true">true</MenuItem>
          </TextField>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            disabled={loading || !newOptText.trim()}
            onClick={async () => {
              const txt = newOptText.trim();
              if (!txt) return;
              const ok = await onAddOption(txt, newOptCorrect);
              if (ok) {
                setNewOptText("");
                setNewOptCorrect(false);
              }
            }}
            sx={{ boxShadow: "0 10px 24px rgba(15,23,42,0.25)" }}
          >
            Add option
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}

function OptionRow(props: {
  opt: QuestionOptionDto;
  loading: boolean;
  onSave: (text: string, isCorrect: boolean) => Promise<boolean>;
  onDelete: () => Promise<boolean>;
  onDraft: (patch: { text?: string; isCorrect?: boolean }) => void;
  theme: any;
}) {
  const { opt, loading, onSave, onDelete, onDraft, theme } = props;

  const [text, setText] = useState(opt.text ?? "");
  const [isCorrect, setIsCorrect] = useState(Boolean(opt.isCorrect));

  useEffect(() => {
    setText(opt.text ?? "");
    setIsCorrect(Boolean(opt.isCorrect));
  }, [opt.id, opt.text, opt.isCorrect]);

  return (
    <Paper
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
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        gap={2}
        alignItems={{ md: "center" }}
      >
        <TextField
          label={`Option #${opt.id}`}
          value={text}
          onChange={(e) => {
            const v = e.target.value;
            setText(v);
            onDraft({ text: v });
          }}
          fullWidth
          size="small"
        />

        <TextField
          label="isCorrect"
          value={isCorrect ? "true" : "false"}
          onChange={(e) => {
            const v = e.target.value === "true";
            setIsCorrect(v);
            onDraft({ isCorrect: v });
          }}
          select
          size="small"
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="false">false</MenuItem>
          <MenuItem value="true">true</MenuItem>
        </TextField>

        <Stack direction="row" gap={1} flexShrink={0} justifyContent="flex-end">
          <Button
            variant="outlined"
            startIcon={<SaveOutlinedIcon />}
            disabled={loading}
            onClick={() => onSave(text.trim(), isCorrect)}
          >
            Save
          </Button>

          <Button
            variant="text"
            color="error"
            startIcon={<DeleteOutlineIcon />}
            disabled={loading}
            onClick={async () => {
              const ok = window.confirm("Delete this option?");
              if (!ok) return;
              await onDelete();
            }}
          >
            Delete
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
