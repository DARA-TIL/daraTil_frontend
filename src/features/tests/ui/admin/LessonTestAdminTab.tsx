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
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import AutoFixHighOutlinedIcon from "@mui/icons-material/AutoFixHighOutlined";
import { useTestAdminStore } from "../../store/useTestAdminStore";
import type { QuestionDto, QuestionOptionDto } from "../../model/types";
import { useTranslation } from "react-i18next";

type Props = { lessonId: number };

type IssueKey = "minOptions" | "oneCorrect";

function validateQuestion(q: QuestionDto) {
  const opts = q.options ?? [];
  const correctCount = opts.filter((o) => o.isCorrect).length;

  const hasMinOptions = opts.length >= 2;
  const hasSingleCorrect = correctCount === 1;

  const ok = hasMinOptions && hasSingleCorrect;

  const issues: IssueKey[] = [];
  if (!hasMinOptions) issues.push("minOptions");
  if (!hasSingleCorrect) issues.push("oneCorrect");

  return { ok, issues, correctCount, optionsCount: opts.length };
}

const LessonTestAdminTab: React.FC<Props> = ({ lessonId }) => {
  const theme = useTheme();
  const { t } = useTranslation("tests");

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

  const questions = test?.questions ?? [];

  const summary = useMemo(() => {
    const total = questions.length;
    let ready = 0;
    let invalid = 0;
    let withCorrect = 0;

    questions.forEach((q) => {
      const v = validateQuestion(q);
      if (v.ok) ready += 1;
      else invalid += 1;
      if (v.correctCount > 0) withCorrect += 1;
    });

    return { total, ready, invalid, withCorrect };
  }, [questions]);

  if (!test) {
    return (
      <Box sx={{ p: 2.2 }}>
        <Stack gap={2}>
          <Box>
            <Typography fontWeight={900}>{t("admin.empty.title")}</Typography>
            <Typography color="text.secondary">
              {t("admin.empty.subtitle")}
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
            {t("admin.empty.createTest")}
          </Button>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2.2 }}>
      <Stack gap={2}>
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
              <Stack
                direction="row"
                gap={1}
                alignItems="center"
                flexWrap="wrap"
                useFlexGap
              >
                <Typography fontWeight={900}>
                  {t("admin.header.title", { id: test.id })}
                </Typography>

                {hasDraft && (
                  <Chip
                    size="small"
                    label={t("admin.badges.unsavedChanges")}
                    sx={{
                      borderRadius: 999,
                      border: "1px solid",
                      borderColor: theme.customColors.sidebarBorder,
                      bgcolor:
                        theme.palette.mode === "light"
                          ? "rgba(251,191,36,0.14)"
                          : "rgba(251,191,36,0.22)",
                      fontWeight: 800,
                    }}
                  />
                )}

                {summary.invalid === 0 && summary.total > 0 ? (
                  <Chip
                    size="small"
                    icon={<CheckCircleOutlineIcon />}
                    label={t("admin.badges.ready")}
                    sx={{
                      borderRadius: 999,
                      border: "1px solid",
                      borderColor: theme.customColors.sidebarBorder,
                      bgcolor:
                        theme.palette.mode === "light"
                          ? "rgba(34,197,94,0.10)"
                          : "rgba(34,197,94,0.18)",
                      fontWeight: 800,
                    }}
                  />
                ) : (
                  <Chip
                    size="small"
                    icon={<ErrorOutlineIcon />}
                    label={
                      summary.total === 0
                        ? t("admin.badges.noQuestions")
                        : t("admin.badges.invalidCount", {
                            count: summary.invalid,
                          })
                    }
                    sx={{
                      borderRadius: 999,
                      border: "1px solid",
                      borderColor: theme.customColors.sidebarBorder,
                      bgcolor:
                        theme.palette.mode === "light"
                          ? "rgba(239,68,68,0.10)"
                          : "rgba(239,68,68,0.18)",
                      fontWeight: 800,
                    }}
                  />
                )}
              </Stack>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.4 }}
              >
                {t("admin.header.summaryLine", summary)}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                {t("admin.header.rules")}
              </Typography>
            </Box>

            <Stack
              direction="row"
              gap={1}
              flexShrink={0}
              justifyContent="flex-end"
              flexWrap="wrap"
              useFlexGap
            >
              <Button
                variant="outlined"
                disabled={!hasDraft || loading}
                onClick={clearDraft}
              >
                {t("admin.actions.resetChanges")}
              </Button>

              <Button
                variant="contained"
                startIcon={<SaveOutlinedIcon />}
                disabled={!hasDraft || loading}
                onClick={saveDraft}
                sx={{ boxShadow: "0 10px 24px rgba(15,23,42,0.25)" }}
              >
                {t("admin.actions.saveAllChanges")}
              </Button>

              <Button
                variant="text"
                color="error"
                startIcon={<DeleteOutlineIcon />}
                disabled={loading}
                onClick={async () => {
                  const ok = window.confirm(t("admin.confirms.deleteTest"));
                  if (!ok) return;
                  await deleteTest(test.id, lessonId);
                }}
              >
                {t("admin.actions.deleteTest")}
              </Button>
            </Stack>
          </Stack>
        </Paper>

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
              label={t("admin.addQuestion.label")}
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
              {t("admin.addQuestion.add")}
            </Button>
          </Stack>
        </Paper>

        <Stack gap={1.5}>
          {questions.map((q) => (
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

  const { t } = useTranslation("tests");

  const [qText, setQText] = useState(q.text ?? "");
  useEffect(() => setQText(q.text ?? ""), [q.text]);

  const [newOptText, setNewOptText] = useState("");
  const [newOptCorrect, setNewOptCorrect] = useState(false);

  const validation = useMemo(() => validateQuestion(q), [q.options, q.text]);
  const hasCorrect = validation.correctCount > 0;

  const add3Quick = async () => {
    await onAddOption(t("admin.quick.optionA"), false);
    await onAddOption(t("admin.quick.optionB"), false);
    await onAddOption(t("admin.quick.optionC"), false);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 4,
        border: "1px solid",
        borderColor: validation.ok
          ? theme.customColors.sidebarBorder
          : theme.palette.error.main,
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
                {t("admin.question.title", { id: q.id })}
              </Typography>

              {validation.ok ? (
                <Chip
                  size="small"
                  icon={<CheckCircleOutlineIcon />}
                  label={t("admin.badges.ready")}
                  sx={{
                    borderRadius: 999,
                    border: "1px solid",
                    borderColor: theme.customColors.sidebarBorder,
                    bgcolor:
                      theme.palette.mode === "light"
                        ? "rgba(34,197,94,0.10)"
                        : "rgba(34,197,94,0.18)",
                    fontWeight: 800,
                  }}
                />
              ) : (
                <Chip
                  size="small"
                  icon={<ErrorOutlineIcon />}
                  label={t("admin.badges.invalid")}
                  sx={{
                    borderRadius: 999,
                    border: "1px solid",
                    borderColor: theme.customColors.sidebarBorder,
                    bgcolor:
                      theme.palette.mode === "light"
                        ? "rgba(239,68,68,0.10)"
                        : "rgba(239,68,68,0.18)",
                    fontWeight: 800,
                  }}
                />
              )}

              {hasCorrect ? (
                <Chip
                  size="small"
                  icon={<CheckCircleOutlineIcon />}
                  label={t("admin.question.correctCount", {
                    count: validation.correctCount,
                  })}
                  sx={{
                    borderRadius: 999,
                    border: "1px solid",
                    borderColor: theme.customColors.sidebarBorder,
                    bgcolor:
                      theme.palette.mode === "light"
                        ? "rgba(34,197,94,0.08)"
                        : "rgba(34,197,94,0.14)",
                    fontWeight: 700,
                  }}
                />
              ) : (
                <Chip
                  size="small"
                  label={t("admin.question.noCorrect")}
                  sx={{
                    borderRadius: 999,
                    border: "1px solid",
                    borderColor: theme.customColors.sidebarBorder,
                    bgcolor:
                      theme.palette.mode === "light"
                        ? "rgba(239,68,68,0.08)"
                        : "rgba(239,68,68,0.14)",
                    fontWeight: 700,
                  }}
                />
              )}

              <Chip
                size="small"
                label={t("admin.question.optionsCount", {
                  count: validation.optionsCount,
                })}
                sx={{
                  borderRadius: 999,
                  border: "1px solid",
                  borderColor: theme.customColors.sidebarBorder,
                  fontWeight: 700,
                }}
              />
            </Stack>

            {!validation.ok ? (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.4 }}
              >
                {validation.issues
                  .map((k) => t(`admin.validation.${k}`))
                  .join(" - ")}
              </Typography>
            ) : (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.4 }}
              >
                {t("admin.question.validHint")}
              </Typography>
            )}
          </Box>

          <Stack
            direction="row"
            gap={1}
            flexShrink={0}
            justifyContent="flex-end"
            flexWrap="wrap"
            useFlexGap
          >
            <Button
              variant="outlined"
              startIcon={<AutoFixHighOutlinedIcon />}
              disabled={loading}
              onClick={add3Quick}
              sx={{ borderRadius: 999 }}
              title={t("admin.quick.tooltip")}
            >
              {t("admin.quick.button")}
            </Button>

            <Button
              variant="text"
              color="error"
              startIcon={<DeleteOutlineIcon />}
              disabled={loading}
              onClick={async () => {
                const ok = window.confirm(t("admin.confirms.deleteQuestion"));
                if (!ok) return;
                await onDelete();
              }}
            >
              {t("admin.actions.deleteQuestion")}
            </Button>
          </Stack>
        </Stack>

        <TextField
          label={t("admin.fields.questionText")}
          value={qText}
          onChange={(e) => {
            const v = e.target.value;
            setQText(v);
            onDraftText(v);
          }}
          fullWidth
        />

        <Divider />

        <Typography fontWeight={900}>
          {t("admin.fields.optionsTitle")}
        </Typography>

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

        <Stack direction={{ xs: "column", md: "row" }} gap={2}>
          <TextField
            label={t("admin.fields.newOption")}
            value={newOptText}
            onChange={(e) => setNewOptText(e.target.value)}
            fullWidth
          />
          <TextField
            label={t("admin.fields.isCorrect")}
            value={newOptCorrect ? "true" : "false"}
            onChange={(e) => setNewOptCorrect(e.target.value === "true")}
            select
            sx={{ minWidth: { md: 180 } }}
          >
            <MenuItem value="false">{t("admin.boolean.false")}</MenuItem>
            <MenuItem value="true">{t("admin.boolean.true")}</MenuItem>
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
            {t("admin.actions.addOption")}
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
  const { t } = useTranslation("tests");

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
        borderColor: isCorrect
          ? theme.palette.success.main
          : theme.customColors.sidebarBorder,
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
          label={t("admin.option.label", { id: opt.id })}
          value={text}
          onChange={(e) => {
            const v = e.target.value;
            setText(v);
            onDraft({ text: v });
          }}
          fullWidth
          size="small"
        />

        <Stack direction="row" gap={1} alignItems="center" flexShrink={0}>
          {isCorrect && (
            <Chip
              size="small"
              label={t("admin.option.correct")}
              sx={{
                borderRadius: 999,
                fontWeight: 900,
                bgcolor:
                  theme.palette.mode === "light"
                    ? "rgba(34,197,94,0.12)"
                    : "rgba(34,197,94,0.20)",
                border: "1px solid",
                borderColor: theme.customColors.sidebarBorder,
              }}
            />
          )}

          <TextField
            label={t("admin.fields.isCorrect")}
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
            <MenuItem value="false">{t("admin.boolean.false")}</MenuItem>
            <MenuItem value="true">{t("admin.boolean.true")}</MenuItem>
          </TextField>
        </Stack>

        <Stack direction="row" gap={1} flexShrink={0} justifyContent="flex-end">
          <Button
            variant="outlined"
            startIcon={<SaveOutlinedIcon />}
            disabled={loading}
            onClick={() => onSave(text.trim(), isCorrect)}
          >
            {t("admin.actions.saveOption")}
          </Button>

          <Button
            variant="text"
            color="error"
            startIcon={<DeleteOutlineIcon />}
            disabled={loading}
            onClick={async () => {
              const ok = window.confirm(t("admin.confirms.deleteOption"));
              if (!ok) return;
              await onDelete();
            }}
          >
            {t("admin.actions.deleteOption")}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
