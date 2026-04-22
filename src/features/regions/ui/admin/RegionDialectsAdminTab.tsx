import React, { useEffect, useState } from "react";
import { alpha, useTheme } from "@mui/material/styles";
import {
  Button,
  Divider,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import type { Region, RegionLanguage, RegionSlangTranslation } from "../../model/types";
import { useRegionsAdminStore } from "../../store/useRegionsAdminStore";
import { useUiStore } from "@/shared/store/useUiStore";
import { requestConfirm } from "@/shared/store/useConfirmDialogStore";
import { useTranslation } from "react-i18next";

type Props = {
  region: Region;
};

type SlangDraft = {
  id: number;
  language: RegionLanguage;
  word: string;
  description: string;
  pronounceUrl: string;
  regionSlangId: number;
};

const LANGUAGE_OPTIONS: RegionLanguage[] = ["KZ", "RU", "EN"];

function createDraft(translation: RegionSlangTranslation): SlangDraft {
  return {
    id: translation.id,
    language: translation.language,
    word: translation.word,
    description: translation.description,
    pronounceUrl: translation.pronounceUrl,
    regionSlangId: translation.regionSlangId,
  };
}

export const RegionDialectsAdminTab: React.FC<Props> = ({ region }) => {
  const theme = useTheme();
  const { t } = useTranslation("admin");
  const showSnackbar = useUiStore((state) => state.showSnackbar);

  const actionLoading = useRegionsAdminStore((state) => state.actionLoading);
  const createSlang = useRegionsAdminStore((state) => state.createSlang);
  const deleteSlang = useRegionsAdminStore((state) => state.deleteSlang);
  const createSlangTranslation = useRegionsAdminStore(
    (state) => state.createSlangTranslation,
  );
  const updateSlangTranslation = useRegionsAdminStore(
    (state) => state.updateSlangTranslation,
  );
  const deleteSlangTranslation = useRegionsAdminStore(
    (state) => state.deleteSlangTranslation,
  );

  const [drafts, setDrafts] = useState<Record<number, SlangDraft>>({});
  const [newSlang, setNewSlang] = useState<SlangDraft>({
    id: 0,
    language: "KZ",
    word: "",
    description: "",
    pronounceUrl: "",
    regionSlangId: 0,
  });
  const [newTranslations, setNewTranslations] = useState<Record<number, SlangDraft>>(
    {},
  );

  useEffect(() => {
    setDrafts(
      Object.fromEntries(
        region.regionSlang.flatMap((slang) =>
          slang.translations.map((translation) => [
            translation.id,
            createDraft(translation),
          ]),
        ),
      ),
    );
    setNewSlang({
      id: 0,
      language: "KZ",
      word: "",
      description: "",
      pronounceUrl: "",
      regionSlangId: 0,
    });
    setNewTranslations(
      Object.fromEntries(
        region.regionSlang.map((slang) => [
          slang.id,
          {
            id: 0,
            language: "KZ",
            word: "",
            description: "",
            pronounceUrl: "",
            regionSlangId: slang.id,
          },
        ]),
      ),
    );
  }, [region]);

  return (
    <Stack spacing={2}>
      <Paper
        variant="outlined"
        sx={{
          p: 1.75,
          borderRadius: 3,
        }}
      >
        <Stack spacing={1.25}>
          <Typography fontWeight={800}>
            {t("regions.actions.addDialect", {
              defaultValue: "Add dialect entry",
            })}
          </Typography>

          <Stack direction={{ xs: "column", md: "row" }} gap={1.5}>
            <TextField
              label={t("regions.fields.language", { defaultValue: "Language" })}
              value={newSlang.language}
              onChange={(event) =>
                setNewSlang((current) => ({
                  ...current,
                  language: event.target.value as RegionLanguage,
                }))
              }
              select
              sx={{ minWidth: 140 }}
            >
              {LANGUAGE_OPTIONS.map((language) => (
                <MenuItem key={language} value={language}>
                  {language}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label={t("regions.fields.word", { defaultValue: "Word" })}
              value={newSlang.word}
              onChange={(event) =>
                setNewSlang((current) => ({
                  ...current,
                  word: event.target.value,
                }))
              }
              fullWidth
            />
          </Stack>

          <TextField
            label={t("regions.fields.pronounceUrl", {
              defaultValue: "Pronounce URL",
            })}
            value={newSlang.pronounceUrl}
            onChange={(event) =>
              setNewSlang((current) => ({
                ...current,
                pronounceUrl: event.target.value,
              }))
            }
            fullWidth
          />

          <TextField
            label={t("regions.fields.description", {
              defaultValue: "Description",
            })}
            value={newSlang.description}
            onChange={(event) =>
              setNewSlang((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            fullWidth
            multiline
            minRows={3}
          />

          <Stack direction="row" justifyContent="flex-end">
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              disabled={actionLoading || !newSlang.word.trim()}
              onClick={async () => {
                const ok = await createSlang({
                  id: 0,
                  regionId: region.id,
                  translations: [
                    {
                      id: 0,
                      language: newSlang.language,
                      word: newSlang.word.trim(),
                      description: newSlang.description.trim(),
                      pronounceUrl: newSlang.pronounceUrl.trim(),
                      regionSlangId: 0,
                    },
                  ],
                });

                if (ok) {
                  showSnackbar(
                    t("regions.snackbar.dialectCreated", {
                      defaultValue: "Dialect entry created",
                    }),
                    "success",
                  );
                  setNewSlang({
                    id: 0,
                    language: "KZ",
                    word: "",
                    description: "",
                    pronounceUrl: "",
                    regionSlangId: 0,
                  });
                }
              }}
            >
              {t("common.create")}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {region.regionSlang.length === 0 ? (
        <Typography color="text.secondary">
          {t("regions.emptyDialects", {
            defaultValue: "No dialect entries yet.",
          })}
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          {region.regionSlang.map((slang) => (
            <Paper
              key={slang.id}
              variant="outlined"
              sx={{
                p: 1.75,
                borderRadius: 3,
              }}
            >
              <Stack spacing={1.5}>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  justifyContent="space-between"
                  gap={1}
                >
                  <Stack spacing={0.35}>
                    <Typography fontWeight={900}>
                      {t("regions.labels.dialectEntry", {
                        defaultValue: "Dialect entry #{{id}}",
                        id: slang.id,
                      })}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t("regions.labels.translationCount", {
                        defaultValue: "Translations: {{count}}",
                        count: slang.translations.length,
                      })}
                    </Typography>
                  </Stack>

                  <Button
                    color="error"
                    variant="text"
                    startIcon={<DeleteOutlineRoundedIcon />}
                    disabled={actionLoading}
                    onClick={async () => {
                      const confirmed = await requestConfirm({
                        title: t("common.delete"),
                        message: t("regions.confirmDeleteDialect", {
                          defaultValue: "Delete this dialect entry?",
                        }),
                        confirmLabel: t("common.delete"),
                        variant: "danger",
                      });
                      if (!confirmed) return;

                      const ok = await deleteSlang(slang.id);
                      if (ok) {
                        showSnackbar(
                          t("regions.snackbar.dialectDeleted", {
                            defaultValue: "Dialect entry deleted",
                          }),
                          "success",
                        );
                      }
                    }}
                  >
                    {t("common.delete")}
                  </Button>
                </Stack>

                <Divider />

                <Stack spacing={1.25}>
                  {slang.translations.map((translation) => {
                    const draft = drafts[translation.id] ?? createDraft(translation);

                    return (
                      <Paper
                        key={translation.id}
                        sx={{
                          p: 1.25,
                          borderRadius: 3,
                          backgroundColor: alpha(theme.palette.primary.main, 0.03),
                        }}
                      >
                        <Stack spacing={1.1}>
                          <Stack direction={{ xs: "column", md: "row" }} gap={1.25}>
                            <TextField
                              label={t("regions.fields.language", {
                                defaultValue: "Language",
                              })}
                              value={draft.language}
                              onChange={(event) =>
                                setDrafts((current) => ({
                                  ...current,
                                  [translation.id]: {
                                    ...draft,
                                    language: event.target.value as RegionLanguage,
                                  },
                                }))
                              }
                              select
                              sx={{ minWidth: 140 }}
                            >
                              {LANGUAGE_OPTIONS.map((language) => (
                                <MenuItem key={language} value={language}>
                                  {language}
                                </MenuItem>
                              ))}
                            </TextField>

                            <TextField
                              label={t("regions.fields.word", {
                                defaultValue: "Word",
                              })}
                              value={draft.word}
                              onChange={(event) =>
                                setDrafts((current) => ({
                                  ...current,
                                  [translation.id]: {
                                    ...draft,
                                    word: event.target.value,
                                  },
                                }))
                              }
                              fullWidth
                            />
                          </Stack>

                          <TextField
                            label={t("regions.fields.pronounceUrl", {
                              defaultValue: "Pronounce URL",
                            })}
                            value={draft.pronounceUrl}
                            onChange={(event) =>
                              setDrafts((current) => ({
                                ...current,
                                [translation.id]: {
                                  ...draft,
                                  pronounceUrl: event.target.value,
                                },
                              }))
                            }
                            fullWidth
                          />

                          <TextField
                            label={t("regions.fields.description", {
                              defaultValue: "Description",
                            })}
                            value={draft.description}
                            onChange={(event) =>
                              setDrafts((current) => ({
                                ...current,
                                [translation.id]: {
                                  ...draft,
                                  description: event.target.value,
                                },
                              }))
                            }
                            fullWidth
                            multiline
                            minRows={3}
                          />

                          <Stack direction="row" justifyContent="flex-end" gap={1}>
                            <Button
                              variant="outlined"
                              startIcon={<SaveRoundedIcon />}
                              disabled={actionLoading || !draft.word.trim()}
                              onClick={async () => {
                                const ok = await updateSlangTranslation({
                                  ...draft,
                                  word: draft.word.trim(),
                                  description: draft.description.trim(),
                                  pronounceUrl: draft.pronounceUrl.trim(),
                                });

                                if (ok) {
                                  showSnackbar(
                                    t("regions.snackbar.dialectTranslationSaved", {
                                      defaultValue: "Dialect translation saved",
                                    }),
                                    "success",
                                  );
                                }
                              }}
                            >
                              {t("common.save")}
                            </Button>

                            <Button
                              color="error"
                              variant="text"
                              startIcon={<DeleteOutlineRoundedIcon />}
                              disabled={actionLoading}
                              onClick={async () => {
                                const confirmed = await requestConfirm({
                                  title: t("common.delete"),
                                  message: t("regions.confirmDeleteDialectTranslation", {
                                    defaultValue:
                                      "Delete this dialect translation?",
                                  }),
                                  confirmLabel: t("common.delete"),
                                  variant: "danger",
                                });
                                if (!confirmed) return;

                                const ok = await deleteSlangTranslation(translation.id);
                                if (ok) {
                                  showSnackbar(
                                    t("regions.snackbar.dialectTranslationDeleted", {
                                      defaultValue: "Dialect translation deleted",
                                    }),
                                    "success",
                                  );
                                }
                              }}
                            >
                              {t("common.delete")}
                            </Button>
                          </Stack>
                        </Stack>
                      </Paper>
                    );
                  })}
                </Stack>

                <Divider />

                {(() => {
                  const draft = newTranslations[slang.id] ?? {
                    id: 0,
                    language: "KZ" as RegionLanguage,
                    word: "",
                    description: "",
                    pronounceUrl: "",
                    regionSlangId: slang.id,
                  };

                  return (
                    <Stack spacing={1.25}>
                      <Typography fontWeight={800}>
                        {t("regions.actions.addDialectTranslation", {
                          defaultValue: "Add dialect translation",
                        })}
                      </Typography>

                      <Stack direction={{ xs: "column", md: "row" }} gap={1.5}>
                        <TextField
                          label={t("regions.fields.language", {
                            defaultValue: "Language",
                          })}
                          value={draft.language}
                          onChange={(event) =>
                            setNewTranslations((current) => ({
                              ...current,
                              [slang.id]: {
                                ...draft,
                                language: event.target.value as RegionLanguage,
                              },
                            }))
                          }
                          select
                          sx={{ minWidth: 140 }}
                        >
                          {LANGUAGE_OPTIONS.map((language) => (
                            <MenuItem key={language} value={language}>
                              {language}
                            </MenuItem>
                          ))}
                        </TextField>

                        <TextField
                          label={t("regions.fields.word", {
                            defaultValue: "Word",
                          })}
                          value={draft.word}
                          onChange={(event) =>
                            setNewTranslations((current) => ({
                              ...current,
                              [slang.id]: {
                                ...draft,
                                word: event.target.value,
                              },
                            }))
                          }
                          fullWidth
                        />
                      </Stack>

                      <TextField
                        label={t("regions.fields.pronounceUrl", {
                          defaultValue: "Pronounce URL",
                        })}
                        value={draft.pronounceUrl}
                        onChange={(event) =>
                          setNewTranslations((current) => ({
                            ...current,
                            [slang.id]: {
                              ...draft,
                              pronounceUrl: event.target.value,
                            },
                          }))
                        }
                        fullWidth
                      />

                      <TextField
                        label={t("regions.fields.description", {
                          defaultValue: "Description",
                        })}
                        value={draft.description}
                        onChange={(event) =>
                          setNewTranslations((current) => ({
                            ...current,
                            [slang.id]: {
                              ...draft,
                              description: event.target.value,
                            },
                          }))
                        }
                        fullWidth
                        multiline
                        minRows={3}
                      />

                      <Stack direction="row" justifyContent="flex-end">
                        <Button
                          variant="contained"
                          startIcon={<AddRoundedIcon />}
                          disabled={actionLoading || !draft.word.trim()}
                          onClick={async () => {
                            const ok = await createSlangTranslation({
                              id: 0,
                              language: draft.language,
                              word: draft.word.trim(),
                              description: draft.description.trim(),
                              pronounceUrl: draft.pronounceUrl.trim(),
                              regionSlangId: slang.id,
                            });

                            if (ok) {
                              showSnackbar(
                                t("regions.snackbar.dialectTranslationCreated", {
                                  defaultValue: "Dialect translation created",
                                }),
                                "success",
                              );
                              setNewTranslations((current) => ({
                                ...current,
                                [slang.id]: {
                                  id: 0,
                                  language: "KZ",
                                  word: "",
                                  description: "",
                                  pronounceUrl: "",
                                  regionSlangId: slang.id,
                                },
                              }));
                            }
                          }}
                        >
                          {t("common.create")}
                        </Button>
                      </Stack>
                    </Stack>
                  );
                })()}
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Stack>
  );
};
