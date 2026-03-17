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
import type {
  Region,
  RegionLanguage,
  RegionTraditionTranslation,
} from "../../model/types";
import { useRegionsAdminStore } from "../../store/useRegionsAdminStore";
import { useUiStore } from "@/shared/store/useUiStore";
import { useTranslation } from "react-i18next";

type Props = {
  region: Region;
};

type TraditionDraft = {
  id: number;
  language: RegionLanguage;
  name: string;
  description: string;
  regionTraditionsId: number;
};

const LANGUAGE_OPTIONS: RegionLanguage[] = ["KZ", "RU", "EN"];

function createDraft(translation: RegionTraditionTranslation): TraditionDraft {
  return {
    id: translation.id,
    language: translation.language,
    name: translation.name,
    description: translation.description,
    regionTraditionsId: translation.regionTraditionsId,
  };
}

export const RegionTraditionsAdminTab: React.FC<Props> = ({ region }) => {
  const theme = useTheme();
  const { t } = useTranslation("admin");
  const showSnackbar = useUiStore((state) => state.showSnackbar);

  const actionLoading = useRegionsAdminStore((state) => state.actionLoading);
  const createTradition = useRegionsAdminStore((state) => state.createTradition);
  const deleteTradition = useRegionsAdminStore((state) => state.deleteTradition);
  const createTraditionTranslation = useRegionsAdminStore(
    (state) => state.createTraditionTranslation,
  );
  const updateTraditionTranslation = useRegionsAdminStore(
    (state) => state.updateTraditionTranslation,
  );
  const deleteTraditionTranslation = useRegionsAdminStore(
    (state) => state.deleteTraditionTranslation,
  );

  const [drafts, setDrafts] = useState<Record<number, TraditionDraft>>({});
  const [newTradition, setNewTradition] = useState<TraditionDraft>({
    id: 0,
    language: "KZ",
    name: "",
    description: "",
    regionTraditionsId: 0,
  });
  const [newTranslations, setNewTranslations] = useState<
    Record<number, TraditionDraft>
  >({});

  useEffect(() => {
    setDrafts(
      Object.fromEntries(
        region.regionTraditions.flatMap((tradition) =>
          tradition.translations.map((translation) => [
            translation.id,
            createDraft(translation),
          ]),
        ),
      ),
    );
    setNewTradition({
      id: 0,
      language: "KZ",
      name: "",
      description: "",
      regionTraditionsId: 0,
    });
    setNewTranslations(
      Object.fromEntries(
        region.regionTraditions.map((tradition) => [
          tradition.id,
          {
            id: 0,
            language: "KZ",
            name: "",
            description: "",
            regionTraditionsId: tradition.id,
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
            {t("regions.actions.addTradition", {
              defaultValue: "Add tradition",
            })}
          </Typography>

          <Stack direction={{ xs: "column", md: "row" }} gap={1.5}>
            <TextField
              label={t("regions.fields.language", { defaultValue: "Language" })}
              value={newTradition.language}
              onChange={(event) =>
                setNewTradition((current) => ({
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
              label={t("regions.fields.name", { defaultValue: "Name" })}
              value={newTradition.name}
              onChange={(event) =>
                setNewTradition((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              fullWidth
            />
          </Stack>

          <TextField
            label={t("regions.fields.description", {
              defaultValue: "Description",
            })}
            value={newTradition.description}
            onChange={(event) =>
              setNewTradition((current) => ({
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
              disabled={actionLoading || !newTradition.name.trim()}
              onClick={async () => {
                const ok = await createTradition({
                  id: 0,
                  regionId: region.id,
                  translations: [
                    {
                      id: 0,
                      language: newTradition.language,
                      name: newTradition.name.trim(),
                      description: newTradition.description.trim(),
                      regionTraditionsId: 0,
                    },
                  ],
                });

                if (ok) {
                  showSnackbar(
                    t("regions.snackbar.traditionCreated", {
                      defaultValue: "Tradition created",
                    }),
                    "success",
                  );
                  setNewTradition({
                    id: 0,
                    language: "KZ",
                    name: "",
                    description: "",
                    regionTraditionsId: 0,
                  });
                }
              }}
            >
              {t("common.create")}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {region.regionTraditions.length === 0 ? (
        <Typography color="text.secondary">
          {t("regions.emptyTraditions", {
            defaultValue: "No traditions yet.",
          })}
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          {region.regionTraditions.map((tradition) => (
            <Paper
              key={tradition.id}
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
                      {t("regions.labels.traditionEntry", {
                        defaultValue: "Tradition #{{id}}",
                        id: tradition.id,
                      })}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t("regions.labels.translationCount", {
                        defaultValue: "Translations: {{count}}",
                        count: tradition.translations.length,
                      })}
                    </Typography>
                  </Stack>

                  <Button
                    color="error"
                    variant="text"
                    startIcon={<DeleteOutlineRoundedIcon />}
                    disabled={actionLoading}
                    onClick={async () => {
                      const confirmed = window.confirm(
                        t("regions.confirmDeleteTradition", {
                          defaultValue: "Delete this tradition?",
                        }),
                      );
                      if (!confirmed) return;

                      const ok = await deleteTradition(tradition.id);
                      if (ok) {
                        showSnackbar(
                          t("regions.snackbar.traditionDeleted", {
                            defaultValue: "Tradition deleted",
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
                  {tradition.translations.map((translation) => {
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
                              label={t("regions.fields.name", {
                                defaultValue: "Name",
                              })}
                              value={draft.name}
                              onChange={(event) =>
                                setDrafts((current) => ({
                                  ...current,
                                  [translation.id]: {
                                    ...draft,
                                    name: event.target.value,
                                  },
                                }))
                              }
                              fullWidth
                            />
                          </Stack>

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
                              disabled={actionLoading || !draft.name.trim()}
                              onClick={async () => {
                                const ok = await updateTraditionTranslation({
                                  ...draft,
                                  name: draft.name.trim(),
                                  description: draft.description.trim(),
                                });

                                if (ok) {
                                  showSnackbar(
                                    t("regions.snackbar.traditionTranslationSaved", {
                                      defaultValue: "Tradition translation saved",
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
                                const confirmed = window.confirm(
                                  t("regions.confirmDeleteTraditionTranslation", {
                                    defaultValue:
                                      "Delete this tradition translation?",
                                  }),
                                );
                                if (!confirmed) return;

                                const ok = await deleteTraditionTranslation(
                                  translation.id,
                                );
                                if (ok) {
                                  showSnackbar(
                                    t("regions.snackbar.traditionTranslationDeleted", {
                                      defaultValue:
                                        "Tradition translation deleted",
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
                  const draft = newTranslations[tradition.id] ?? {
                    id: 0,
                    language: "KZ" as RegionLanguage,
                    name: "",
                    description: "",
                    regionTraditionsId: tradition.id,
                  };

                  return (
                    <Stack spacing={1.25}>
                      <Typography fontWeight={800}>
                        {t("regions.actions.addTraditionTranslation", {
                          defaultValue: "Add tradition translation",
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
                              [tradition.id]: {
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
                          label={t("regions.fields.name", {
                            defaultValue: "Name",
                          })}
                          value={draft.name}
                          onChange={(event) =>
                            setNewTranslations((current) => ({
                              ...current,
                              [tradition.id]: {
                                ...draft,
                                name: event.target.value,
                              },
                            }))
                          }
                          fullWidth
                        />
                      </Stack>

                      <TextField
                        label={t("regions.fields.description", {
                          defaultValue: "Description",
                        })}
                        value={draft.description}
                        onChange={(event) =>
                          setNewTranslations((current) => ({
                            ...current,
                            [tradition.id]: {
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
                          disabled={actionLoading || !draft.name.trim()}
                          onClick={async () => {
                            const ok = await createTraditionTranslation({
                              id: 0,
                              language: draft.language,
                              name: draft.name.trim(),
                              description: draft.description.trim(),
                              regionTraditionsId: tradition.id,
                            });

                            if (ok) {
                              showSnackbar(
                                t("regions.snackbar.traditionTranslationCreated", {
                                  defaultValue:
                                    "Tradition translation created",
                                }),
                                "success",
                              );
                              setNewTranslations((current) => ({
                                ...current,
                                [tradition.id]: {
                                  id: 0,
                                  language: "KZ",
                                  name: "",
                                  description: "",
                                  regionTraditionsId: tradition.id,
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
