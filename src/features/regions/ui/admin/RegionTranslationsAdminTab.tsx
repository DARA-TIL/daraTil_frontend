import React, { useEffect, useState } from "react";
import {
  Button,
  Chip,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import TranslateRoundedIcon from "@mui/icons-material/TranslateRounded";
import type { Region, RegionLanguage, RegionTranslation } from "../../model/types";
import { useRegionsAdminStore } from "../../store/useRegionsAdminStore";
import { useUiStore } from "@/shared/store/useUiStore";
import { useTranslation } from "react-i18next";

type Props = {
  region: Region;
};

type TranslationDraft = {
  id: number;
  language: RegionLanguage;
  name: string;
  description: string;
  regionId: number;
};

const LANGUAGE_OPTIONS: RegionLanguage[] = ["KZ", "RU", "EN"];

function createDraft(translation: RegionTranslation): TranslationDraft {
  return {
    id: translation.id,
    language: translation.language,
    name: translation.name,
    description: translation.description,
    regionId: translation.regionId,
  };
}

export const RegionTranslationsAdminTab: React.FC<Props> = ({ region }) => {
  const { t } = useTranslation("admin");
  const showSnackbar = useUiStore((state) => state.showSnackbar);
  const actionLoading = useRegionsAdminStore((state) => state.actionLoading);
  const createTranslation = useRegionsAdminStore((state) => state.createTranslation);
  const updateTranslation = useRegionsAdminStore((state) => state.updateTranslation);
  const deleteTranslation = useRegionsAdminStore((state) => state.deleteTranslation);

  const [drafts, setDrafts] = useState<Record<number, TranslationDraft>>({});
  const [newTranslation, setNewTranslation] = useState<TranslationDraft>({
    id: 0,
    language: "KZ",
    name: "",
    description: "",
    regionId: region.id,
  });

  useEffect(() => {
    setDrafts(
      Object.fromEntries(
        region.translations.map((translation) => [
          translation.id,
          createDraft(translation),
        ]),
      ),
    );
    setNewTranslation({
      id: 0,
      language: "KZ",
      name: "",
      description: "",
      regionId: region.id,
    });
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
            {t("regions.actions.addTranslation", {
              defaultValue: "Add translation",
            })}
          </Typography>

          <Stack direction={{ xs: "column", md: "row" }} gap={1.5}>
            <TextField
              label={t("regions.fields.language", { defaultValue: "Language" })}
              value={newTranslation.language}
              onChange={(event) =>
                setNewTranslation((current) => ({
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
              value={newTranslation.name}
              onChange={(event) =>
                setNewTranslation((current) => ({
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
            value={newTranslation.description}
            onChange={(event) =>
              setNewTranslation((current) => ({
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
              disabled={actionLoading || !newTranslation.name.trim()}
              onClick={async () => {
                const ok = await createTranslation({
                  ...newTranslation,
                  id: 0,
                  regionId: region.id,
                  name: newTranslation.name.trim(),
                  description: newTranslation.description.trim(),
                });

                if (ok) {
                  showSnackbar(
                    t("regions.snackbar.translationCreated", {
                      defaultValue: "Region translation created",
                    }),
                    "success",
                  );
                  setNewTranslation({
                    id: 0,
                    language: "KZ",
                    name: "",
                    description: "",
                    regionId: region.id,
                  });
                }
              }}
            >
              {t("common.create")}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {region.translations.length === 0 ? (
        <Typography color="text.secondary">
          {t("regions.emptyTranslations", {
            defaultValue: "No translations yet.",
          })}
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          {region.translations.map((translation) => {
            const draft = drafts[translation.id] ?? createDraft(translation);

            return (
              <Paper
                key={translation.id}
                variant="outlined"
                sx={{
                  p: 1.75,
                  borderRadius: 3,
                }}
              >
                <Stack spacing={1.25}>
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    justifyContent="space-between"
                    gap={1.5}
                  >
                    <Chip
                      icon={<TranslateRoundedIcon />}
                      label={draft.language}
                      sx={{ alignSelf: "flex-start" }}
                    />

                    <Stack direction="row" gap={1}>
                      <Button
                        variant="outlined"
                        startIcon={<SaveRoundedIcon />}
                        disabled={actionLoading || !draft.name.trim()}
                        onClick={async () => {
                          const ok = await updateTranslation({
                            ...draft,
                            name: draft.name.trim(),
                            description: draft.description.trim(),
                          });

                          if (ok) {
                            showSnackbar(
                              t("regions.snackbar.translationSaved", {
                                defaultValue: "Region translation saved",
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
                            t("regions.confirmDeleteTranslation", {
                              defaultValue: "Delete this translation?",
                            }),
                          );
                          if (!confirmed) return;

                          const ok = await deleteTranslation(translation.id);
                          if (ok) {
                            showSnackbar(
                              t("regions.snackbar.translationDeleted", {
                                defaultValue: "Region translation deleted",
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

                  <TextField
                    label={t("regions.fields.language", { defaultValue: "Language" })}
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
                    sx={{ maxWidth: 180 }}
                  >
                    {LANGUAGE_OPTIONS.map((language) => (
                      <MenuItem key={language} value={language}>
                        {language}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    label={t("regions.fields.name", { defaultValue: "Name" })}
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
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
};
