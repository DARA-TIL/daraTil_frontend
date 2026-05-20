import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  MenuItem,
  Pagination,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import RecordVoiceOverRoundedIcon from "@mui/icons-material/RecordVoiceOverRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import TranslateRoundedIcon from "@mui/icons-material/TranslateRounded";
import { useTranslation } from "react-i18next";
import { requestConfirm } from "@/shared/store/useConfirmDialogStore";
import { useUiStore } from "@/shared/store/useUiStore";
import {
  isSpeechTestDraftValid,
} from "../../model/normalize";
import {
  getSpeechDifficultyColor,
  getSpeechDifficultyLabel,
  SPEECH_DIFFICULTY_OPTIONS,
} from "../../model/presentation";
import type { SpeechTestCreateDto, SpeechTest } from "../../model/types";
import { useSpeechTestAdminStore } from "../../store/useSpeechTestAdminStore";

const ROWS_PER_PAGE_OPTIONS = [5, 8, 12];

function createEmptyDraft(): SpeechTestCreateDto {
  return {
    kz_text: "",
    ru_text: "",
    en_text: "",
    difficulty: "easy",
  };
}

const SpeechTestsManagementPage: React.FC = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const { t } = useTranslation("pronunciation");
  const showSnackbar = useUiStore((state) => state.showSnackbar);

  const items = useSpeechTestAdminStore((state) => state.items);
  const total = useSpeechTestAdminStore((state) => state.total);
  const selectedId = useSpeechTestAdminStore((state) => state.selectedId);
  const selected = useSpeechTestAdminStore((state) => state.selected);
  const loading = useSpeechTestAdminStore((state) => state.loading);
  const selectedLoading = useSpeechTestAdminStore(
    (state) => state.selectedLoading,
  );
  const actionLoading = useSpeechTestAdminStore((state) => state.actionLoading);
  const filters = useSpeechTestAdminStore((state) => state.filters);
  const setFilter = useSpeechTestAdminStore((state) => state.setFilter);
  const resetFilters = useSpeechTestAdminStore((state) => state.resetFilters);
  const getFilteredItems = useSpeechTestAdminStore(
    (state) => state.getFilteredItems,
  );
  const fetchAll = useSpeechTestAdminStore((state) => state.fetchAll);
  const selectById = useSpeechTestAdminStore((state) => state.selectById);
  const clearSelected = useSpeechTestAdminStore((state) => state.clearSelected);
  const create = useSpeechTestAdminStore((state) => state.create);
  const update = useSpeechTestAdminStore((state) => state.update);
  const remove = useSpeechTestAdminStore((state) => state.delete);

  const [draft, setDraft] = useState<SpeechTestCreateDto>(createEmptyDraft());
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (!selected) {
      setDraft(createEmptyDraft());
      return;
    }

    setDraft({
      kz_text: selected.kz_text,
      ru_text: selected.ru_text,
      en_text: selected.en_text,
      difficulty: selected.difficulty,
    });
  }, [selected]);

  useEffect(() => {
    setPage(1);
  }, [filters.search, filters.difficulty]);

  const rows = [...getFilteredItems()].sort((left, right) => right.id - left.id);
  const pageCount = Math.max(1, Math.ceil(rows.length / rowsPerPage));

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return rows.slice(start, start + rowsPerPage);
  }, [page, rows, rowsPerPage]);

  const isCreateMode = !selectedId;
  const valid = isSpeechTestDraftValid(draft);

  function setDraftField<K extends keyof SpeechTestCreateDto>(
    key: K,
    value: SpeechTestCreateDto[K],
  ) {
    setDraft((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSave() {
    if (!valid) {
      showSnackbar(
        t("admin.validation.required", {
          defaultValue: "Fill all text fields and choose a difficulty.",
        }),
        "warning",
      );
      return;
    }

    const ok = isCreateMode
      ? await create(draft)
      : await update(selectedId, draft);

    if (ok) {
      showSnackbar(
        t(isCreateMode ? "admin.snackbar.created" : "admin.snackbar.saved", {
          defaultValue: isCreateMode
            ? "Speech test created"
            : "Speech test saved",
        }),
        "success",
      );
    }
  }

  async function handleDelete(item: SpeechTest) {
    const confirmed = await requestConfirm({
      title: t("admin.confirmDeleteTitle", {
        defaultValue: "Delete speech test?",
      }),
      message: t("admin.confirmDeleteMessage", {
        defaultValue:
          "This pronunciation task will be removed from the admin collection.",
      }),
      confirmLabel: t("admin.actions.delete", { defaultValue: "Delete" }),
      variant: "danger",
    });

    if (!confirmed) return;
    const ok = await remove(item.id);
    if (ok) {
      showSnackbar(
        t("admin.snackbar.deleted", { defaultValue: "Speech test deleted" }),
        "success",
      );
    }
  }

  return (
    <Box>
      <Stack
        direction={{ xs: "column", lg: "row" }}
        alignItems={{ xs: "stretch", lg: "center" }}
        justifyContent="space-between"
        gap={2}
        mb={2}
      >
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <RecordVoiceOverRoundedIcon color="primary" />
            <Typography variant="h5" fontWeight={900}>
              {t("admin.title", {
                defaultValue: "Speech tests admin",
              })}
            </Typography>
          </Stack>
          <Typography color="text.secondary">
            {t("admin.subtitle", {
              defaultValue:
                "Create Kazakh pronunciation tasks, translations, and difficulty levels.",
            })}
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} gap={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshRoundedIcon />}
            onClick={() => void fetchAll(true)}
          >
            {t("admin.actions.refresh", { defaultValue: "Refresh tests" })}
          </Button>

          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={clearSelected}
          >
            {t("admin.actions.new", { defaultValue: "New test" })}
          </Button>
        </Stack>
      </Stack>

      <Paper
        sx={{
          p: 2,
          mb: 2,
          border: "1px solid",
          borderColor: theme.customColors.sidebarBorder,
        }}
      >
        <Stack direction={{ xs: "column", md: "row" }} gap={2}>
          <TextField
            label={t("admin.filters.search", { defaultValue: "Search" })}
            value={filters.search}
            onChange={(event) => setFilter("search", event.target.value)}
            fullWidth
          />

          <TextField
            label={t("admin.fields.difficulty", { defaultValue: "Difficulty" })}
            value={filters.difficulty}
            onChange={(event) =>
              setFilter(
                "difficulty",
                event.target.value as typeof filters.difficulty,
              )
            }
            select
            sx={{ minWidth: { md: 220 } }}
          >
            <MenuItem value="">
              {t("admin.filters.all", { defaultValue: "All" })}
            </MenuItem>
            {SPEECH_DIFFICULTY_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>
                {getSpeechDifficultyLabel(option, t)}
              </MenuItem>
            ))}
          </TextField>

          <Button
            variant="outlined"
            onClick={resetFilters}
            sx={{ minWidth: 140 }}
          >
            {t("admin.actions.reset", { defaultValue: "Reset" })}
          </Button>
        </Stack>
      </Paper>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: isDesktop
            ? "minmax(340px, 38%) minmax(0, 1fr)"
            : "minmax(0, 1fr)",
          gap: 2,
          alignItems: "start",
        }}
      >
        <Paper
          sx={{
            p: 2,
            border: "1px solid",
            borderColor: theme.customColors.sidebarBorder,
          }}
        >
          <Stack spacing={1.3}>
            <Stack direction="row" justifyContent="space-between" gap={1}>
              <Typography fontWeight={900}>
                {t("admin.listTitle", { defaultValue: "Pronunciation tasks" })}
              </Typography>
              <Chip
                size="small"
                label={t("admin.total", {
                  defaultValue: "{{count}} total",
                  count: total || items.length,
                })}
              />
            </Stack>

            {loading ? (
              <Stack gap={1}>
                <Skeleton variant="rounded" height={118} />
                <Skeleton variant="rounded" height={118} />
                <Skeleton variant="rounded" height={118} />
              </Stack>
            ) : rows.length === 0 ? (
              <Typography color="text.secondary">
                {t("admin.empty", { defaultValue: "No speech tests found." })}
              </Typography>
            ) : (
              <Stack gap={1.2}>
                {paginatedRows.map((item) => {
                  const active = item.id === selectedId;

                  return (
                    <Paper
                      key={item.id}
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        borderRadius: 3,
                        cursor: "pointer",
                        borderColor: active
                          ? theme.palette.primary.main
                          : theme.customColors.sidebarBorder,
                        backgroundImage: active ? theme.gradients.cardSoft : "none",
                      }}
                      onClick={() => void selectById(item.id)}
                    >
                      <Stack spacing={1}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="flex-start"
                          gap={1}
                        >
                          <Box sx={{ minWidth: 0 }}>
                            <Typography fontWeight={900} noWrap>
                              {item.kz_text}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              noWrap
                            >
                              {item.ru_text}
                            </Typography>
                          </Box>

                          <Chip
                            size="small"
                            color={getSpeechDifficultyColor(item.difficulty)}
                            label={getSpeechDifficultyLabel(item.difficulty, t)}
                          />
                        </Stack>

                        <Stack direction="row" gap={1} flexWrap="wrap" useFlexGap>
                          <Chip
                            size="small"
                            icon={<TranslateRoundedIcon />}
                            label="KZ / RU / EN"
                          />
                          <Chip
                            size="small"
                            label={t("admin.taskId", {
                              defaultValue: "#{{id}}",
                              id: item.id,
                            })}
                          />
                        </Stack>
                      </Stack>
                    </Paper>
                  );
                })}

                <Stack
                  direction={{ xs: "column", md: "row" }}
                  alignItems={{ xs: "stretch", md: "center" }}
                  justifyContent="space-between"
                  gap={1.25}
                >
                  <Typography variant="body2" color="text.secondary">
                    {t("admin.pagination.summary", {
                      defaultValue: "Showing {{from}}-{{to}} of {{total}}",
                      from: (page - 1) * rowsPerPage + 1,
                      to: Math.min(page * rowsPerPage, rows.length),
                      total: rows.length,
                    })}
                  </Typography>

                  <Stack direction={{ xs: "column", sm: "row" }} gap={1}>
                    <TextField
                      label={t("admin.pagination.perPage", {
                        defaultValue: "Per page",
                      })}
                      value={rowsPerPage}
                      onChange={(event) => {
                        setRowsPerPage(Number(event.target.value) || 8);
                        setPage(1);
                      }}
                      select
                      size="small"
                      sx={{ minWidth: 120 }}
                    >
                      {ROWS_PER_PAGE_OPTIONS.map((value) => (
                        <MenuItem key={value} value={value}>
                          {value}
                        </MenuItem>
                      ))}
                    </TextField>

                    <Pagination
                      page={page}
                      count={pageCount}
                      color="primary"
                      shape="rounded"
                      onChange={(_, nextPage) => setPage(nextPage)}
                    />
                  </Stack>
                </Stack>
              </Stack>
            )}
          </Stack>
        </Paper>

        <Paper
          sx={{
            p: 2,
            border: "1px solid",
            borderColor: theme.customColors.sidebarBorder,
          }}
        >
          {selectedLoading ? (
            <Stack spacing={2}>
              <Skeleton variant="rounded" height={180} />
              <Skeleton variant="rounded" height={58} />
              <Skeleton variant="rounded" height={130} />
            </Stack>
          ) : (
            <Stack spacing={2}>
              <Box
                sx={{
                  minHeight: 190,
                  p: 2.4,
                  borderRadius: 4,
                  color: "#fff",
                  backgroundImage:
                    "radial-gradient(circle at 84% 20%, rgba(255,255,255,0.24), transparent 24%), linear-gradient(135deg, rgba(14,116,144,0.95), rgba(37,99,235,0.86), rgba(88,28,135,0.82))",
                }}
              >
                <Stack spacing={1}>
                  <Chip
                    label={
                      isCreateMode
                        ? t("admin.mode.create", { defaultValue: "Create mode" })
                        : t("admin.mode.edit", { defaultValue: "Edit mode" })
                    }
                    sx={{
                      alignSelf: "flex-start",
                      bgcolor: "rgba(255,255,255,0.18)",
                      color: "#fff",
                    }}
                  />
                  <Typography variant="h4" fontWeight={900}>
                    {draft.kz_text ||
                      t("admin.previewTitle", {
                        defaultValue: "New pronunciation task",
                      })}
                  </Typography>
                  <Typography sx={{ opacity: 0.9 }}>
                    {draft.ru_text ||
                      t("admin.previewSubtitle", {
                        defaultValue:
                          "Kazakh phrase, Russian translation, English translation, and difficulty.",
                      })}
                  </Typography>
                </Stack>
              </Box>

              <TextField
                label={t("admin.fields.kzText", {
                  defaultValue: "Kazakh text",
                })}
                value={draft.kz_text}
                onChange={(event) => setDraftField("kz_text", event.target.value)}
                multiline
                minRows={3}
                fullWidth
              />

              <Stack direction={{ xs: "column", md: "row" }} gap={2}>
                <TextField
                  label={t("admin.fields.ruText", {
                    defaultValue: "Russian text",
                  })}
                  value={draft.ru_text}
                  onChange={(event) =>
                    setDraftField("ru_text", event.target.value)
                  }
                  multiline
                  minRows={3}
                  fullWidth
                />

                <TextField
                  label={t("admin.fields.enText", {
                    defaultValue: "English text",
                  })}
                  value={draft.en_text}
                  onChange={(event) =>
                    setDraftField("en_text", event.target.value)
                  }
                  multiline
                  minRows={3}
                  fullWidth
                />
              </Stack>

              <TextField
                label={t("admin.fields.difficulty", {
                  defaultValue: "Difficulty",
                })}
                value={draft.difficulty}
                onChange={(event) =>
                  setDraftField(
                    "difficulty",
                    event.target.value as SpeechTestCreateDto["difficulty"],
                  )
                }
                select
                fullWidth
              >
                {SPEECH_DIFFICULTY_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {getSpeechDifficultyLabel(option, t)}
                  </MenuItem>
                ))}
              </TextField>

              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  borderColor: theme.customColors.sidebarBorder,
                  backgroundColor: alpha(theme.palette.info.main, 0.05),
                }}
              >
                <Typography color="text.secondary">
                  {t("admin.note", {
                    defaultValue:
                      "Users will receive the Kazakh text as the phrase to pronounce. The translation shown in the practice UI follows the current app language.",
                  })}
                </Typography>
              </Paper>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                gap={1.2}
              >
                <Button variant="outlined" onClick={clearSelected}>
                  {t("admin.actions.resetForm", { defaultValue: "Reset form" })}
                </Button>

                <Stack direction={{ xs: "column", sm: "row" }} gap={1}>
                  {!isCreateMode && selected ? (
                    <Button
                      color="error"
                      startIcon={<DeleteOutlineRoundedIcon />}
                      disabled={actionLoading}
                      onClick={() => void handleDelete(selected)}
                    >
                      {t("admin.actions.delete", { defaultValue: "Delete" })}
                    </Button>
                  ) : null}

                  <Button
                    variant="contained"
                    startIcon={isCreateMode ? <AddRoundedIcon /> : <SaveRoundedIcon />}
                    disabled={actionLoading || !valid}
                    onClick={() => void handleSave()}
                  >
                    {isCreateMode
                      ? t("admin.actions.create", { defaultValue: "Create" })
                      : t("admin.actions.save", { defaultValue: "Save" })}
                  </Button>
                </Stack>
              </Stack>
            </Stack>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default SpeechTestsManagementPage;
